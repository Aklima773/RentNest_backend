
import { PaymentMethod, PaymentStatus } from "../../../prisma/schema/generated/prisma";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";


const createCheckoutSession = async (userId: string, rentalRequestId: string) => {
    // 1. Verify the rental request exists and belongs to the user
    const rentalRequest = await prisma.rentalRequest.findUniqueOrThrow({
        where: { id: rentalRequestId },
        include: { property: true }
    });

    if (rentalRequest.tenantId !== userId) {
        throw new Error("Unauthorized: This rental request does not belong to you.");
    }

    // 2. Check if payment is already completed
    const existingPayment = await prisma.payment.findUnique({
        where: { rentalRequestId }
    });

    if (existingPayment && existingPayment.status === PaymentStatus.completed) {
        throw new Error("This rental request has already been paid for.");
    }

    // Use property price (convert Decimal to number)
    const amount = Number(rentalRequest.property.price || 1000);

    // 3. Create Stripe Checkout Session (Without payment_method_types)
    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                price_data: {
                    currency: 'bdt',
                    product_data: {
                        name: `Rental Payment - ${rentalRequest.property.title}`,
                    },
                    unit_amount: Math.round(amount * 100), // amount in paisa/cents
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `${config.app_url}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config.app_url}/payment/cancel`,
        metadata: {
            userId,
            rentalRequestId,
        },
    });

    // 4. Upsert a pending payment record in database
    await prisma.payment.upsert({
        where: { rentalRequestId },
        update: {
            transactionId: session.id,
            status: PaymentStatus.completed,
        },
        create: {
            rentalRequestId,
            tenantId: userId,
            amount: rentalRequest.property.price,
            currency: 'BDT',
            method: PaymentMethod.Stripe,
            transactionId: session.id,
            status: PaymentStatus.completed,
        },
    });

    return {
        paymentUrl: session.url,
    };
};

const handleWebhook = async (payload: Buffer, signature: string) => {
    const endpointSecret = config.stripe_webhook_secret;
    const event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as any;
            const rentalRequestId = session.metadata?.rentalRequestId;
            const paymentIntentId = session.payment_intent as string || session.id;

            if (rentalRequestId) {
                await prisma.payment.update({
                    where: { rentalRequestId },
                    data: {
                        status: PaymentStatus.completed,
                        transactionId: paymentIntentId,
                        paidAt: new Date(),
                    },
                });
            }
            break;
        }
        default:
            console.log(`Unhandled event type: ${event.type}`);
    }
};

const getUserPayments = async (userId: string) => {
    return await prisma.payment.findMany({
        where: { tenantId: userId },
        include: {
            rentalRequest: {
                include: { property: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
};

export const paymentServices = {
    createCheckoutSession,
    handleWebhook,
    getUserPayments,
};