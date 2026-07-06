import { Router } from "express";
import { categoryController } from "../category/category.controller";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";
import { adminController } from "./admin.controller";


const router = Router();

router.get('/users', auth(Role.ADMIN), adminController.getAllUsers)

router.get('/categories', categoryController.getAllCategories)
router.post('/categories', auth(Role.ADMIN), categoryController.createCategory)



export const adminRoutes = router