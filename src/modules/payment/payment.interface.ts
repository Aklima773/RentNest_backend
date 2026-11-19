import { PaymentMethod, PaymentStatus } from "../../../generated/prisma";


// 1. Payload sent from frontend to initiate checkout
export interface ICreateCheckoutSessionPayload {
  rentalRequestId: string;
}

// 2. Metadata attached to Stripe Checkout Session for webhook fulfillment
export interface IStripeSessionMetadata {
  rentalRequestId: string;
  tenantId: string;
}

// 3. Payload used internally when creating the Payment record in Prisma
export interface ICreatePaymentRecord {
  rentalRequestId: string;
  tenantId: string;
  amount: number;
  currency?: string;
  method: PaymentMethod;
  transactionId: string;
  status: PaymentStatus;
  paidAt?: Date;
}

// 4. Standardized response returned to the client
export interface ICheckoutSessionResponse {
  checkoutUrl: string | null;
  sessionId: string;
}