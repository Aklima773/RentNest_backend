import { Router } from "express";
import { paymentController } from "./payment.controller";
import { auth } from "../../middlewares/auth";
import { UserRole } from "../../../prisma/generated/prisma";

// Matches your UserRole enum in Prisma schema

const router = Router();

router.post(
    "/checkout",
    auth(UserRole.tenant, UserRole.admin), // Make sure enum values match UserRole in schema
    paymentController.createCheckoutSession
);

router.post(
    "/webhook",
    // Important: Stripe webhooks require express.raw() middleware configured in app.ts for this route
    paymentController.handleWebhook
);

router.get(
    "/history",
    auth(UserRole.tenant, UserRole.admin),
    paymentController.getUserPayments
);

export const paymentRoutes = router;