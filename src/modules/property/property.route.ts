import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { UserRole } from "../../../generated/prisma";
import { propertyController } from "./property.controller";


const router = Router();

router.post("/",
    auth(UserRole.tenant, UserRole.landlord),
    propertyController.createProperty
)

router.get(
  "/my-properties",
  auth(UserRole.landlord),
  propertyController.getLandlordProperties
);

router.get(
  "/",
  propertyController.getAllProperties
);

router.get(
  "/:id",
  auth(UserRole.landlord),
  propertyController.getLandlordPropertyById
);

// Update property details or availability
router.patch(
  "/:id",
  auth(UserRole.landlord),
  propertyController.updateProperty
);

// Delete property
router.delete(
  "/:id",
  auth(UserRole.landlord),
  propertyController.deleteProperty
);

export const propertyRoutes = router;