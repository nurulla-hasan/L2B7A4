import { Router } from "express";
import { technicianController } from "./technician.controller";
import { auth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { technicianValidation } from "../../validation/technician.schema";
import { Role } from "../../../generated/prisma/enums";

const publicRouter = Router();

publicRouter.get("/", technicianController.getAllTechnicians);
publicRouter.get("/:id", technicianController.getSingleTechnician);






const managementRouter = Router();

managementRouter.put("/profile", auth(Role.TECHNICIAN), validate(technicianValidation.updateProfileSchema), technicianController.updateProfile);
managementRouter.put("/availability", auth(Role.TECHNICIAN), validate(technicianValidation.updateAvailabilitySchema), technicianController.updateAvailability);
managementRouter.get("/bookings", auth(Role.TECHNICIAN), technicianController.getMyBookings);
managementRouter.patch("/bookings/:id", auth(Role.TECHNICIAN), validate(technicianValidation.updateBookingStatusSchema), technicianController.updateBookingStatus);

export const technicianPublicRoutes = publicRouter;
export const technicianManagementRoutes = managementRouter;
