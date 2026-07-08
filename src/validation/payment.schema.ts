import { z } from "zod";

const createPaymentSchema = z.object({
  bookingId: z.uuid("Invalid booking ID format"),
});

export const paymentValidation = {
  createPaymentSchema,
};
