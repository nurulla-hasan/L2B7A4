import { Router } from "express";
import { authController } from "./auth.controller";
import { auth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { authValidation } from "../../validation/auth.schema";

const router = Router();

router.post("/login", validate(authValidation.loginSchema), authController.loginUser)
router.post("/register", validate(authValidation.registerSchema), authController.registerUser)
router.post("/refresh-token", validate(authValidation.refreshTokenSchema), authController.refreshToken)
router.get("/me", auth(), authController.getMe)


export const authRoutes = router