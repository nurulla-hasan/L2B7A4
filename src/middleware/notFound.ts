import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

export const notFound = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  (error as any).statusCode = httpStatus.NOT_FOUND;
  next(error);
};
