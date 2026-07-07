import { Router } from "express";
import { bookingController } from "./booking.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/", auth(Role.CUSTOMER), bookingController.createBooking);
router.get("/", auth(), bookingController.getMyBookings);
router.get("/:id", auth(), bookingController.getSingleBooking);

export const bookingRoutes = router;
