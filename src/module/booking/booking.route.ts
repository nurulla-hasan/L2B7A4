import { Router } from "express";
import { bookingController } from "./booking.controller";
import { auth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { bookingValidation } from "../../validation/booking.schema";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/", auth(Role.CUSTOMER), validate(bookingValidation.createBookingSchema), bookingController.createBooking);
router.get("/", auth(Role.CUSTOMER), bookingController.getMyBookings);
router.get("/:id", auth(Role.CUSTOMER), bookingController.getSingleBooking);
router.patch("/:id/cancel", auth(Role.CUSTOMER), bookingController.cancelBooking);

export const bookingRoutes = router;
