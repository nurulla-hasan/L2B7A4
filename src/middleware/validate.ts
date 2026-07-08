import { NextFunction, Request, Response } from "express";
import { ZodError, ZodType } from "zod";
import { catchAsync } from "../utils/catchAsync";
import AppError from "../utils/AppError";
import httpStatus from "http-status";

export const validate = (schema: ZodType) => {
  return catchAsync(
    async (req: Request, _res: Response, next: NextFunction) => {
      try {
        schema.parse(req.body);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          const errorDetails = error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          }));

          throw new AppError(
            httpStatus.BAD_REQUEST,
            errorDetails.map((e) => `${e.path}: ${e.message}`).join(" | "),
            errorDetails,
          );
        }
        next(error);
      }
    },
  );
};
