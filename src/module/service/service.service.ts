import { prisma } from "../../lib/prisma";
import { ICreateService, IUpdateService } from "./service.interface";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";

const getAllServicesFromDB = async () => {
  const result = await prisma.service.findMany({
    orderBy: {
      name: "desc",
    },
  });

  return result;
};

const getSingleServiceFromDB = async (id: string) => {
  const result = await prisma.service.findUnique({
    where: {
      id,
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Service not found!");
  }

  return result;
};

const createServiceIntoDB = async (
  userId: string,
  serviceData: ICreateService,
) => {
  const result = await prisma.service.create({
    data: { ...serviceData, technicianId: userId },
  });

  return result;
};

const updateServiceFromDB = async (
  userId: string,
  id: string,
  serviceData: IUpdateService,
) => {
  const existingService = await prisma.service.findUnique({ where: { id } });

  if (!existingService) throw new AppError(httpStatus.NOT_FOUND, "Service not found!");

  if (existingService.technicianId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, "You can only update your own services!");
  }

  const result = await prisma.service.update({
    where: {
      id,
    },
    data: serviceData,
  });

  return result;
};

const deleteServiceFromDB = async (userId: string, id: string) => {
  const existingService = await prisma.service.findUnique({ where: { id } });

  if (!existingService) throw new AppError(httpStatus.NOT_FOUND, "Service not found!");

  if (existingService.technicianId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, "You can only delete your own services!");
  }

  const result = await prisma.service.delete({
    where: {
      id,
    },
  });

  return result;
};

export const serviceServices = {
  getAllServicesFromDB,
  getSingleServiceFromDB,
  createServiceIntoDB,
  updateServiceFromDB,
  deleteServiceFromDB,
};
