import { Router } from "express";
import { bookingController } from "./booking.controller";
import { auth } from "../../middleware/auth";

const router = Router();

router.post("/", auth(), bookingController.createBooking);
router.get("/", auth(), bookingController.getMyBookings);
router.get("/:id", auth(), bookingController.getSingleBooking);

export const bookingRoutes = router;
