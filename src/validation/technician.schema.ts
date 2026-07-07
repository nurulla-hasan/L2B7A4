import { z } from "zod";

const updateProfileSchema = z.object({
  skills: z.string().min(2, "Skills must be at least 2 characters").optional(),
  experience: z.string().min(2, "Experience must be at least 2 characters").optional(),
  pricing: z.number().positive("Pricing must be a positive number").optional(),
});

const updateAvailabilitySchema = z
  .object({})
  .catchall(z.array(z.string()))
  .refine((val) => Object.keys(val).length > 0, {
    message: "At least one availability day is required",
  });

const updateBookingStatusSchema = z.object({
  status: z.enum(["ACCEPTED", "DECLINED", "IN_PROGRESS", "COMPLETED"] as const, {
    error: "Status must be one of: ACCEPTED, DECLINED, IN_PROGRESS, COMPLETED",
  }),
});

export const technicianValidation = {
  updateProfileSchema,
  updateAvailabilitySchema,
  updateBookingStatusSchema,
};
