import { Router } from "express";
import { bookingController } from "./booking.controller";
import { auth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { bookingValidation } from "../../validation/booking.schema";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/", auth(Role.CUSTOMER), validate(bookingValidation.createBookingSchema), bookingController.createBooking);
router.get("/", auth(), bookingController.getMyBookings);
router.get("/:id", auth(), bookingController.getSingleBooking);
router.patch("/:id/cancel", auth(Role.CUSTOMER), bookingController.cancelBooking);

export const bookingRoutes = router;
