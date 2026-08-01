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
    const minRating = Number(rating);

    if (Number.isNaN(minRating)) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Rating must be a valid number",
      );
    }

    const qualifiedRows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT u."id"
    FROM "User" u
    INNER JOIN "Booking" b ON b."technicianId" = u."id"
    INNER JOIN "Review" r ON r."bookingId" = b."id"
    WHERE u."role" = 'TECHNICIAN'
    GROUP BY u."id"
    HAVING AVG(r."rating") >= ${minRating}
  `;

    const qualifiedIds = qualifiedRows.map((row) => row.id);
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
      services: {
        select: {
          id: true,
          name: true,
          location: true,
          price: true,
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
      services: {
        select: {
          id: true,
          name: true,
          location: true,
          price: true,
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

  // `name` lives on User; the rest on TechnicianProfile
  const { name, ...profileData } = data;

  const result = await prisma.$transaction(async (tx) => {
    if (name) {
      await tx.user.update({
        where: { id: userId },
        data: { name },
      });
    }

    return tx.technicianProfile.update({
      where: { userId },
      data: profileData,
    });
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
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only update your own bookings!",
    );
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

const getDashboardStatsFromDB = async (userId: string) => {
  const [
    totalBookings,
    bookingStatusCounts,
    activeServices,
    earningsAgg,
    ratingAgg,
    upcomingBookings,
    recentReviews,
  ] = await Promise.all([
    prisma.booking.count({ where: { technicianId: userId } }),
    prisma.booking.groupBy({
      by: ["status"],
      where: { technicianId: userId },
      _count: { _all: true },
    }),
    prisma.service.count({ where: { technicianId: userId } }),
    prisma.payment.aggregate({
      where: {
        status: "COMPLETED",
        booking: { technicianId: userId },
      },
      _sum: { amount: true },
    }),
    prisma.review.aggregate({
      where: { booking: { technicianId: userId } },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    prisma.booking.findMany({
      where: {
        technicianId: userId,
        scheduleDate: { gte: new Date() },
        status: {
          in: ["REQUESTED", "ACCEPTED", "PAID", "IN_PROGRESS"],
        },
      },
      orderBy: { scheduleDate: "asc" },
      take: 5,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        service: { select: { id: true, name: true, price: true } },
      },
    }),
    prisma.review.findMany({
      where: { booking: { technicianId: userId } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        booking: {
          select: {
            id: true,
            service: { select: { name: true } },
            customer: { select: { id: true, name: true } },
          },
        },
      },
    }),
  ]);

  const statusCount = (status: string) =>
    bookingStatusCounts.find((item) => item.status === status)?._count._all ?? 0;

  const averageRating = ratingAgg._avg.rating
    ? Number(Number(ratingAgg._avg.rating).toFixed(1))
    : 0;

  return {
    totals: {
      bookings: totalBookings,
      // Needs the technician's attention: decide on requests, start paid work
      pendingBookings: statusCount("REQUESTED") + statusCount("PAID"),
      activeServices,
      completedBookings: statusCount("COMPLETED"),
      earnings: Number(earningsAgg._sum.amount ?? 0),
      averageRating,
      reviewCount: ratingAgg._count.rating,
    },
    bookingStatusCounts: {
      REQUESTED: statusCount("REQUESTED"),
      ACCEPTED: statusCount("ACCEPTED"),
      DECLINED: statusCount("DECLINED"),
      CANCELLED: statusCount("CANCELLED"),
      PAID: statusCount("PAID"),
      IN_PROGRESS: statusCount("IN_PROGRESS"),
      COMPLETED: statusCount("COMPLETED"),
    },
    upcomingAppointments: upcomingBookings,
    recentReviews: recentReviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      customerName: review.booking.customer.name,
      serviceName: review.booking.service.name,
    })),
  };
};

export const technicianService = {
  getAllTechniciansFromDB,
  getSingleTechnicianFromDB,
  updateProfileIntoDB,
  updateAvailabilityIntoDB,
  getMyBookingsFromDB,
  updateBookingStatusFromDB,
  getDashboardStatsFromDB,
};
