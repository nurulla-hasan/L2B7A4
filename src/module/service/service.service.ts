import { prisma } from "../../lib/prisma";
import { ICreateService, IServiceQuery, IUpdateService } from "./service.interface";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import { Prisma } from "../../../generated/prisma/client";

const getAllServicesFromDB = async (query: IServiceQuery) => {
  const {
    searchTerm,
    type,
    location,
    rating,
    minPrice,
    maxPrice,
    sortBy,
    page = "1",
    limit = "12",
  } = query;

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
    const minRating = Number(rating);

    if (Number.isNaN(minRating)) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Rating must be a valid number",
      );
    }

    const qualifiedRows = await prisma.$queryRaw<{ id: string }[]>`
      SELECT s."id"
      FROM "Service" s
      INNER JOIN "Booking" b ON b."serviceId" = s."id"
      INNER JOIN "Review" r ON r."bookingId" = b."id"
      GROUP BY s."id"
      HAVING AVG(r."rating") >= ${minRating}
    `;

    const qualifiedIds = qualifiedRows.map((row) => row.id);
    andConditions.push({ id: { in: qualifiedIds } });
  }

  if (minPrice || maxPrice) {
    const priceFilter: Prisma.DecimalFilter = {};
    if (minPrice) priceFilter.gte = parseFloat(minPrice as string);
    if (maxPrice) priceFilter.lte = parseFloat(maxPrice as string);
    andConditions.push({ price: priceFilter });
  }

  // Pagination
  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 12));
  const skip = (pageNum - 1) * limitNum;

  // Sorting
  const orderByMap: Record<string, Prisma.ServiceOrderByWithRelationInput> = {
    price_asc: { price: "asc" },
    price_desc: { price: "desc" },
    newest: { createdAt: "desc" },
    name_asc: { name: "asc" },
  };

  let orderBy: Prisma.ServiceOrderByWithRelationInput =
    orderByMap[sortBy as string] ?? { createdAt: "desc" };

  // Rating sorting needs raw query — fallback to newest
  let sortedIds: string[] | null = null;

  if (sortBy === "rating_desc") {
    sortedIds = (
      await prisma.$queryRaw<{ id: string }[]>`
        SELECT s."id"
        FROM "Service" s
        LEFT JOIN "Booking" b ON b."serviceId" = s."id"
        LEFT JOIN "Review" r ON r."bookingId" = b."id"
        GROUP BY s."id"
        ORDER BY COALESCE(AVG(r."rating"), 0) DESC, s."createdAt" DESC
      `
    ).map((r) => r.id);

    // Skip + take manually for rating sort
    const paginatedIds = sortedIds.slice(skip, skip + limitNum);

    const [results, total] = await Promise.all([
      prisma.service.findMany({
        where: { id: { in: paginatedIds } },
        include: {
          category: { select: { id: true, name: true } },
          technician: { select: { id: true, name: true } },
        },
      }),
      prisma.service.count({ where: { AND: andConditions } }),
    ]);

    // Maintain sort order
    const idOrder = new Map(paginatedIds.map((id, i) => [id, i]));
    results.sort(
      (a, b) => (idOrder.get(a.id) ?? 0) - (idOrder.get(b.id) ?? 0),
    );

    return { data: results, meta: { page: pageNum, limit: limitNum, total: Number(total) } };
  }

  const [results, total] = await Promise.all([
    prisma.service.findMany({
      where: { AND: andConditions },
      include: {
        category: { select: { id: true, name: true } },
        technician: { select: { id: true, name: true } },
      },
      orderBy,
      skip,
      take: limitNum,
    }),
    prisma.service.count({ where: { AND: andConditions } }),
  ]);

  return { data: results, meta: { page: pageNum, limit: limitNum, total: Number(total) } };
};

const getRelatedServicesFromDB = async (serviceId: string) => {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: { categoryId: true, location: true },
  });

  if (!service) {
    throw new AppError(httpStatus.NOT_FOUND, "Service not found!");
  }

  const results = await prisma.service.findMany({
    where: {
      id: { not: serviceId },
      OR: [
        { categoryId: service.categoryId },
        { location: { contains: service.location, mode: "insensitive" } },
      ],
    },
    include: {
      category: { select: { id: true, name: true } },
      technician: { select: { id: true, name: true } },
    },
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  return results;
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

const getMyServicesFromDB = async (userId: string) => {
  const result = await prisma.service.findMany({
    where: {
      technicianId: userId,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      name: "desc",
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
  getMyServicesFromDB,
};
