import { z } from "zod";

const createReviewSchema = z.object({
  bookingId: z.uuid("Invalid booking ID format"),
  rating: z
    .number()
    .int("Rating must be an integer")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must not exceed 5"),
  comment: z
    .string()
    .min(2, "Comment must be at least 2 characters")
    .max(1000, "Comment must not exceed 1000 characters"),
});

export const reviewValidation = {
  createReviewSchema,
};
