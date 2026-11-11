import { Router } from "express";
import { auth } from "../../middlewares/auth";

import { reviewController } from "./review.controller";
import { UserRole } from "../../../generated/prisma";


const router = Router();

router.post(
  "/",
  auth(UserRole.tenant),
  reviewController.createReview
);

router.get(
  "/my-reviews",
  auth(UserRole.tenant),
  reviewController.getMyReviews
);
router.get(
  "/my-reviews/:id",
  auth(UserRole.tenant),
  reviewController.getMyReviewsbyPropertyId
);

router.get(
  "/allreviews/:id",
  auth(UserRole.landlord),
  reviewController.getAllReviewsByPropertyId
);

router.patch(
  "/:id",
  auth(UserRole.tenant),
  reviewController.updateReview
);

router.delete(
  "/:id",
  auth(UserRole.tenant),
  reviewController.deleteReview
);

// Landlord route to view rental history and tenant reviews


router.get(
  "/allreviews",
  reviewController.getLandlordRentalHistory
);




export const reviewRoutes = router;