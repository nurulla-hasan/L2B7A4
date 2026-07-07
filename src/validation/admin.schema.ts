import { z } from "zod";

const updateUserStatusSchema = z.object({
  activeStatus: z.enum(["ACTIVE", "BLOCKED"] as const, {
    error: "Status must be either ACTIVE or BLOCKED",
  }),
});

export const adminValidation = {
  updateUserStatusSchema,
};
