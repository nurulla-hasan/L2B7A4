import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";
import config from "../config";
import { prisma } from "../lib/prisma";
import AppError from "../utils/AppError";
import { Role } from "../../generated/prisma/client";

export const auth = (...requiredRoles: Role[]) => {
  return catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
    const token =
      req.cookies?.accessToken ??
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : req.headers.authorization);

    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, "You are not logged in!");
    }

    const decoded = jwtUtils.verifyToken(token, config.jwt_access_secret);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id as string },
      select: { id: true, name: true, email: true, role: true, activeStatus: true },
    });

    if (!user) {
      throw new AppError(httpStatus.UNAUTHORIZED, "User not found!");
    }

    if (user.activeStatus === "BLOCKED") {
      throw new AppError(httpStatus.UNAUTHORIZED, "Your account has been blocked!");
    }

    if (requiredRoles.length && !requiredRoles.includes(user.role)) {
      throw new AppError(httpStatus.FORBIDDEN, "You do not have permission to access this resource!");
    }

    req.user = user;
    next();
  });
};
