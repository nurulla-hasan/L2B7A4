import { z } from "zod";

const createPaymentSchema = z.object({
  bookingId: z.uuid("Invalid booking ID format"),
  amount: z.number().positive("Amount must be a positive number"),
});

export const paymentValidation = {
  createPaymentSchema,
};
