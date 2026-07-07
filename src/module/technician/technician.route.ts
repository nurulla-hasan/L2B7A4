import { Router } from "express";
import { technicianController } from "./technician.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

const publicRouter = Router();

publicRouter.get("/", technicianController.getAllTechnicians);
publicRouter.get("/:id", technicianController.getSingleTechnician);






const managementRouter = Router();

managementRouter.put("/profile", auth(Role.TECHNICIAN), technicianController.updateProfile);
managementRouter.put("/availability", auth(Role.TECHNICIAN), technicianController.updateAvailability);
managementRouter.get("/bookings", auth(Role.TECHNICIAN), technicianController.getMyBookings);
managementRouter.patch("/bookings/:bookingId", auth(Role.TECHNICIAN), technicianController.updateBookingStatus);

export const technicianPublicRoutes = publicRouter;
export const technicianManagementRoutes = managementRouter;
