import { NextFunction, Request, Response } from "express"
import { prisma } from "../lib/prisma"
import { SubscriptionStatus } from "../../generated/prisma/enums"
import { catchAsync } from "../utils/catchAsync"
import httpStatus from "http-status"


export const subscriptionGuard = () => {
    return catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const userId = req.user?.id

            if (!userId) {
                res.status(httpStatus.UNAUTHORIZED).json({
                    success: false,
                    message: "Unauthorized: Please log in first."
                });
                return;
            }

            const subscription = await prisma.subscription.findUnique({
                where: {
                    userId
                }
            });

            if (!subscription) {
                 res.status(httpStatus.FORBIDDEN).json({
                    success: false,
                    message: "Please subscribe to get access to premium content."
                });
                 return;
            }

            // Check if status is ACTIVE and the period end is still in the future
            const isCurrentlyActive = 
                subscription.status === SubscriptionStatus.ACTIVE &&
                subscription.currentPeriodEnd && 
                new Date(subscription.currentPeriodEnd) > new Date();

            if (!isCurrentlyActive) {
                 res.status(httpStatus.FORBIDDEN).json({
                    success: false,
                    message: "Your subscription has expired or is inactive. Please subscribe again to get access."
                });
                 return;
            }

            next()
        }
    )
}