import { Router } from "express";
import { authController } from "./auth.controller";
import { auth } from "../../middleware/auth";

const router = Router();

router.post("/login", authController.loginUser)
router.post("/register", authController.registerUser)
router.get("/me", auth(), authController.getMe)


export const authRoutes = router