import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { ICreateBooking } from "./booking.interface";
import httpStatus from "http-status";
import { BookingStatus } from "../../../generated/prisma/enums";

const createBookingIntoDB = async (userId: string, data: ICreateBooking) => {
  const result = await prisma.booking.create({
    data: {
      technicianId: data.technicianId,
      serviceId: data.serviceId,
      scheduleDate: new Date(data.scheduleDate),
      timeSlot: data.timeSlot,
      customerId: userId,
    },
  });

  return result;
};

const getMyBookingsFromDB = async (userId: string) => {
  const result = await prisma.booking.findMany({
    where: {
      customerId: userId,
    },
    include: {
      service: {
        select: {
          id: true,
          name: true,
          price: true,
        },
      },

      technician: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      payment: {
        select: {
          id: true,
          status: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

const getSingleBookingFromDB = async (bookingId: string, userId: string) => {
  const result = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
    include: {
      service: {
        select: {
          id: true,
          name: true,
          price: true,
          description: true,
        },
      },
      technician: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      payment: {
        select: {
          id: true,
          status: true,
          amount: true,
          method: true,
        },
      },
      review: {
        select: {
          id: true,
          rating: true,
          comment: true,
        },
      },
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found!");
  }

  if (result.customerId !== userId && result.technicianId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, "You can only access your own bookings!");
  }

  return result;
};

const cancelBookingFromDB = async (userId: string, bookingId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found!");
  }

  if (booking.customerId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only cancel your own bookings!",
    );
  }

  const cancellableStatuses: BookingStatus[] = [
    "REQUESTED",
    "ACCEPTED",
    "PAID",
  ];

  if (!cancellableStatuses.includes(booking.status)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Booking cannot be cancelled at this stage!",
    );
  }

  const result = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: BookingStatus.DECLINED },
  });

  return result;
};

export const bookingService = {
  createBookingIntoDB,
  getMyBookingsFromDB,
  getSingleBookingFromDB,
  cancelBookingFromDB,
};
