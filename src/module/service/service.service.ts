import { prisma } from "../../lib/prisma";
import { ICreateService, IServiceQuery, IUpdateService } from "./service.interface";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import { Prisma } from "../../../generated/prisma/client";

const getAllServicesFromDB = async (query : IServiceQuery) => {
  const { searchTerm, type, location, rating, minPrice, maxPrice } = query;

  const andConditions: Prisma.ServiceWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: [
        {
          name: {
            contains: searchTerm as string,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: searchTerm as string,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (type) {
    andConditions.push({
      category: {
        name: {
          equals: type as string,
          mode: "insensitive",
        },
      },
    });
  }

  if (location) {
    andConditions.push({
      location: {
        contains: location as string,
        mode: "insensitive",
      },
    });
  }

  if (rating) {
    andConditions.push({
      bookings: {
        some: {
          review: {
            rating: {
              gte: parseInt(rating as string),
            },
          },
        },
      },
    });
  }

  if (minPrice || maxPrice) {
    const priceFilter: Prisma.DecimalFilter = {};
    if (minPrice) priceFilter.gte = parseFloat(minPrice as string);
    if (maxPrice) priceFilter.lte = parseFloat(maxPrice as string);
    andConditions.push({ price: priceFilter });
  }
  

  const result = await prisma.service.findMany({
    where: {
      AND: andConditions,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      technician: {
        select: {
          id: true,
          name: true,
          technicianProfile: {
            select: {
              availability: true,
            },
          },
        },
      },
    },
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
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      technician: {
        select: {
          id: true,
          name: true,
          technicianProfile: {
            select: {
              availability: true,
            },
          },
        },
      },
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

  if (!existingService)
    throw new AppError(httpStatus.NOT_FOUND, "Service not found!");

  if (existingService.technicianId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only update your own services!",
    );
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

  if (!existingService)
    throw new AppError(httpStatus.NOT_FOUND, "Service not found!");

  if (existingService.technicianId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only delete your own services!",
    );
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
