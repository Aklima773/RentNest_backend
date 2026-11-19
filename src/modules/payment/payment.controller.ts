import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { paymentServices } from "./payment.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from 'http-status';

const createCheckoutSession = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        const { rentalRequestId } = req.body;

        if (!rentalRequestId) {
            return res.status(400).json({
                success: false,
                message: "rentalRequestId is required in the request body"
            });
        }

        const result = await paymentServices.createCheckoutSession(userId as string, rentalRequestId);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Checkout session created successfully",
            data: result,
        });
    }
);

const handleWebhook = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const signature = req.headers['stripe-signature'] as string;

        // Note: req.body must be the raw Buffer for Stripe signature verification
        await paymentServices.handleWebhook(req.body, signature);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Webhook processed successfully",
            data: null,
        });
    }
);

const getUserPayments = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        const result = await paymentServices.getUserPayments(userId as string);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Payment history retrieved successfully",
            data: result,
        });
    }
);

export const paymentController = {
    createCheckoutSession,
    handleWebhook,
    getUserPayments,
};