import { z } from "zod";

const createServiceSchema = z.object({
  name: z
    .string()
    .min(2, "Service name must be at least 2 characters")
    .max(255, "Service name must not exceed 255 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters"),
  price: z
    .number()
    .positive("Price must be a positive number")
    .max(999999, "Price is too large"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  categoryId: z.uuid("Invalid category ID format"),
});

const updateServiceSchema = z.object({
  name: z
    .string()
    .min(2, "Service name must be at least 2 characters")
    .max(255, "Service name must not exceed 255 characters")
    .optional(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .optional(),
  price: z.number().positive("Price must be a positive number").max(999999, "Price is too large").optional(),
  location: z.string().min(2, "Location must be at least 2 characters").optional(),
  categoryId: z.uuid("Invalid category ID format").optional(),
});

export const serviceValidation = {
  createServiceSchema,
  updateServiceSchema,
};
