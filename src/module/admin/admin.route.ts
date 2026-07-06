import { Router } from "express";
import { categoryController } from "../category/category.controller";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";


const router = Router();

router.get('/categories', categoryController.getAllCategories)
router.post('/categories', auth(Role.ADMIN), categoryController.createCategory)



export const adminRoutes = router