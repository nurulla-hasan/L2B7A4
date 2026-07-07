import { Router } from "express";
import { paymentController } from "./payment.controller";
import { auth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { paymentValidation } from "../../validation/payment.schema";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get("/success", paymentController.paymentSuccess);
router.get("/fail", paymentController.paymentFail);
router.get("/cancel", paymentController.paymentCancel);
router.post("/ipn", paymentController.paymentIpn);


router.post("/create", auth(Role.CUSTOMER), validate(paymentValidation.createPaymentSchema), paymentController.createPayment);
router.get("/", auth(), paymentController.getMyPayments);
router.get("/:id", auth(), paymentController.getSinglePayment);

export const paymentRoutes = router;
