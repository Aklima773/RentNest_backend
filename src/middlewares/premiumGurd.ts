import { NextFunction, Request, Response } from "express"
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

         




     

            next()
        }
    )
}