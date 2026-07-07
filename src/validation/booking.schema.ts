import { z } from "zod";

const createBookingSchema = z.object({
  technicianId: z.uuid("Invalid technician ID format"),
  serviceId: z.uuid("Invalid service ID format"),
  scheduleDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Schedule date must be in YYYY-MM-DD format"),
  timeSlot: z.string().min(5, "Time slot is required (e.g. 09:00-12:00)"),
});

export const bookingValidation = {
  createBookingSchema,
};
