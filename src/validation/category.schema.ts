import { z } from "zod";

const createCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must not exceed 100 characters"),
});

export const categoryValidation = {
  createCategorySchema,
};
