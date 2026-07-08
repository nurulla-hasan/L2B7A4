import { BookingStatus, Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import {
  IUpdateProfile,
  IUpdateAvailability,
  ItechnicianQuery,
} from "./technician.interface";
import { Prisma } from "../../../generated/prisma/client";

const getAllTechniciansFromDB = async (query: ItechnicianQuery) => {
  const { searchTerm, location, rating, minPrice, maxPrice } = query;

  const andConditions: Prisma.UserWhereInput[] = [];

  andConditions.push({
    role: Role.TECHNICIAN,
  });

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
          technicianProfile: {
            skills: {
              contains: searchTerm as string,
              mode: "insensitive",
            },
          },
        },
      ],
    });
  }

  if (location) {
    andConditions.push({
      services: {
        some: {
          location: {
            contains: location as string,
            mode: "insensitive",
          },
        },
      },
    });
  }

  if (minPrice || maxPrice) {
    const priceFilter: Prisma.DecimalFilter = {};
    if (minPrice) priceFilter.gte = parseFloat(minPrice as string);
    if (maxPrice) priceFilter.lte = parseFloat(maxPrice as string);
    andConditions.push({
      technicianProfile: {
        pricing: priceFilter,
      },
    });
  }

  if (rating) {
    const allTechs = await prisma.user.findMany({
      where: { role: Role.TECHNICIAN },
      select: {
        id: true,
        technicianBookings: {
          select: {
            review: {
              select: { rating: true },
            },
          },
        },
      },
    });

    const minRating = parseInt(rating as string);
    const qualifiedIds = allTechs
      .filter((tech) => {
        const ratings = tech.technicianBookings
          .filter((b) => b.review !== null)
          .map((b) => b.review!.rating);
        if (ratings.length === 0) return false;
        const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        return avg >= minRating;
      })
      .map((tech) => tech.id);

    andConditions.push({ id: { in: qualifiedIds } });
  }

  const result = await prisma.user.findMany({
    where: {
      AND: andConditions,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      activeStatus: true,
      createdAt: true,
      updatedAt: true,
      technicianProfile: {
        select: {
          id: true,
          skills: true,
          experience: true,
          pricing: true,
          availability: true,
        },
      },
    },
  });

  return result;
};

const getSingleTechnicianFromDB = async (id: string) => {
  const result = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      activeStatus: true,
      createdAt: true,
      updatedAt: true,
      technicianProfile: {
        select: {
          id: true,
          skills: true,
          experience: true,
          pricing: true,
          availability: true,
        },
      },
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Technician not found!");
  }

  const reviews = await prisma.review.findMany({
    where: {
      booking: {
        technicianId: id,
      },
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    ...result,
    reviews,
  };
};

const updateProfileIntoDB = async (userId: string, data: IUpdateProfile) => {
  const existing = await prisma.technicianProfile.findUnique({
    where: { userId },
  });

  if (!existing) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Technician profile not found! Please create a profile first.",
    );
  }

  const result = await prisma.technicianProfile.update({
    where: { userId },
    data,
  });

  return result;
};

const updateAvailabilityIntoDB = async (
  userId: string,
  data: IUpdateAvailability,
) => {
  const existing = await prisma.technicianProfile.findUnique({
    where: { userId },
  });

  if (!existing) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Technician availability not found! Please create a profile first.",
    );
  }

  const result = await prisma.technicianProfile.update({
    where: { userId },
    data: {
      availability: data,
    },
  });

  return result;
};

const getMyBookingsFromDB = async (userId: string) => {
  const result = await prisma.booking.findMany({
    where: {
      technicianId: userId,
    },
    include: {
      customer: {
        select: { id: true, name: true, email: true },
      },
      service: {
        select: { id: true, name: true, price: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return result.map((booking) => {
    return {
      id: booking.id,
      serviceId: booking.serviceId,
      serviceName: booking.service.name,
      price: booking.service.price,
      customerName: booking.customer.name,
      customerEmail: booking.customer.email,
      scheduleDate: booking.scheduleDate,
      timeSlot: booking.timeSlot,
      status: booking.status,
    };
  });
};

const updateBookingStatusFromDB = async (
  userId: string,
  bookingId: string,
  status: string,
) => {
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
  });

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found!");
  }

  if (booking.technicianId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, "You can only update your own bookings!");
  }

  const validTransitions: Record<string, string[]> = {
    REQUESTED: ["ACCEPTED", "DECLINED"],
    PAID: ["IN_PROGRESS"],
    IN_PROGRESS: ["COMPLETED"],
  };

  const allowedTransitions = validTransitions[booking.status];

  if (!allowedTransitions || !allowedTransitions.includes(status)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid status transition!");
  }

  const result = await prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      status: status as BookingStatus,
    },
  });

  return result;
};

export const technicianService = {
  getAllTechniciansFromDB,
  getSingleTechnicianFromDB,
  updateProfileIntoDB,
  updateAvailabilityIntoDB,
  getMyBookingsFromDB,
  updateBookingStatusFromDB,
};
