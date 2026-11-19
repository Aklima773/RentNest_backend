import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { UserRole } from "../../../generated/prisma";
import { rentalController } from "./rentalrequest.controller";


const router = Router();

// Tenant Routes
router.post(
  "/",
  auth(UserRole.tenant),
  rentalController.createRentalRequest  
);

router.get(
  "/my-requests",
  auth(UserRole.tenant),
  rentalController.getMyRentalRequests
);

router.patch(
  "/:id",
  auth(UserRole.tenant),
  rentalController.updateRentalRequest
);

router.delete(
  "/:id",
  auth(UserRole.tenant),
  rentalController.deleteRentalRequest
);

// Landlord Routes
router.get(
  "/landlord/:propertyId",
  auth(UserRole.landlord),
  rentalController.getLandlordPropertyRequests
);

router.patch(
  "/:id/status",
  auth(UserRole.landlord),
  rentalController.updateRentalStatus
);

export const rentalRouter = router;