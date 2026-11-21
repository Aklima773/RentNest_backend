import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { reviewController } from "./review.controller";
import { UserRole } from "../../../prisma/generated/prisma";



const router = Router();

// Tenant: Create review (allowed only when payment.status === completed)
router.post(
  "/",
  auth(UserRole.tenant),
  reviewController.createReview
);

// Tenant: Get all reviews written by logged-in tenant
router.get(
  "/my-reviews",
  auth(UserRole.tenant),
  reviewController.getMyReviews
);

// Tenant: Get logged-in tenant's reviews for a specific property
router.get(
  "/my-reviews/:propertyId",
  auth(UserRole.tenant),
  reviewController.getMyReviewsByPropertyId
);

// Tenant: Edit their own review
router.patch(
  "/:id",
  auth(UserRole.tenant),
  reviewController.updateReview
);

// Tenant: Delete their own review
router.delete(
  "/:id",
  auth(UserRole.tenant),
  reviewController.deleteReview
);

// Landlord: View reviews ONLY for a property they own by propertyId
router.get(
  "/property/:propertyId",
  auth(UserRole.landlord),
  reviewController.getAllReviewsByPropertyId
);

export const reviewRoutes = router;