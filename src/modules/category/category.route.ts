import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { categoryController } from "./category.controller";
import { UserRole } from "../../../prisma/generated/prisma";





const router = Router();

// Public route to view all categories (needed for tenant/landlord dropdowns)
router.get("/", categoryController.getAllCategories);


router.get("/:id", categoryController.getCategoryById);

// Protected route: Only Admins can create categories
router.post(
  "/",
  auth(UserRole.admin), 
  categoryController.createCategory
);

router.patch(
  "/:id",
  auth(UserRole.admin), 
  categoryController.updateCategory
);
router.delete(
  "/:id",
  auth(UserRole.admin), 
  categoryController.deleteCategory
);

export const categoryRouter = router;