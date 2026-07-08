import { Router } from "express";
import { categoryController } from "../category/category.controller";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { adminValidation } from "../../validation/admin.schema";
import { categoryValidation } from "../../validation/category.schema";
import { adminController } from "./admin.controller";

const router = Router();

router.get("/users", auth(Role.ADMIN), adminController.getAllUsers);
router.patch("/users/:id", auth(Role.ADMIN), validate(adminValidation.updateUserStatusSchema), adminController.updateUserStatus);
router.get("/bookings", auth(Role.ADMIN), adminController.getAllBookings);

router.get(
  "/categories",
  auth(Role.ADMIN),
  categoryController.getAllCategories,
);
router.post("/categories", auth(Role.ADMIN), validate(categoryValidation.createCategorySchema), categoryController.createCategory);
router.patch("/categories/:id", auth(Role.ADMIN), validate(categoryValidation.updateCategorySchema), categoryController.updateCategory);
router.delete("/categories/:id", auth(Role.ADMIN), categoryController.deleteCategory);

export const adminRoutes = router;
