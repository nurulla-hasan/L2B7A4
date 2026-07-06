import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import config from "../config";

type TErrorResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  errorSources?: { path: string | number; message: string }[];
  stack?: string;
};

export const globalErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  let message = err.message || "Something went wrong!";

  // Prisma: Unique constraint violation
  if (err.code === "P2002") {
    statusCode = httpStatus.CONFLICT;
    const field = err.meta?.target?.[0] || "field";
    message = `Duplicate value for '${field}'. This ${field} already exists.`;
  }

  // Prisma: Record not found
  if (err.code === "P2025") {
    statusCode = httpStatus.NOT_FOUND;
    message = err.meta?.cause || "Record not found.";
  }

  // Prisma: Foreign key constraint
  if (err.code === "P2003") {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Invalid reference: the related record does not exist.";
  }

  // Prisma: Invalid data type
  if (err.code === "P2006") {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Invalid data type provided.";
  }

  const errorResponse: TErrorResponse = {
    success: false,
    statusCode,
    message,
  };

  if (config.node_env === "development") {
    errorResponse.stack = err.stack;
    errorResponse.errorSources = err.meta
      ? [{ path: "database", message: JSON.stringify(err.meta) }]
      : undefined;
  }

  res.status(statusCode).json(errorResponse);
};
