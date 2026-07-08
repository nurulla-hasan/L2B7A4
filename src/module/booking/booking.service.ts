import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { ICreateBooking } from "./booking.interface";
import httpStatus from "http-status";
import { BookingStatus, Role } from "../../../generated/prisma/enums";

const createBookingIntoDB = async (userId: string, data: ICreateBooking) => {

  const technician = await prisma.user.findUnique({
    where: { id: data.technicianId },
    include: {
      technicianProfile: {
        select: { availability: true },
      },
    },
  });

  if (!technician) {
    throw new AppError(httpStatus.NOT_FOUND, "Technician not found!");
  }

  if (technician.role !== Role.TECHNICIAN) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Selected user is not a technician!",
    );
  }

  if (data.technicianId === userId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You cannot book your own service!",
    );
  }

  const service = await prisma.service.findUnique({
    where: { id: data.serviceId },
  });

  if (!service) {
    throw new AppError(httpStatus.NOT_FOUND, "Service not found!");
  }

  if (service.technicianId !== data.technicianId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This service does not belong to the selected technician!",
    );
  }

  const bookingDate = new Date(data.scheduleDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (bookingDate <= today) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Schedule date must be a future date!",
    );
  }

  const availability = technician.technicianProfile
    ?.availability as Record<string, string[]> | null;

  if (availability && Object.keys(availability).length > 0) {
    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const dayOfWeek = dayNames[bookingDate.getDay()];
    const availableSlots = availability[dayOfWeek];

    if (!availableSlots || availableSlots.length === 0) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Technician is not available on ${dayOfWeek}!`,
      );
    }

    const isSlotAvailable = availableSlots.some((slot) => {
      const [slotStart, slotEnd] = slot.split("-");
      const [reqStart, reqEnd] = data.timeSlot.split("-");
      return reqStart >= slotStart && reqEnd <= slotEnd;
    });

    if (!isSlotAvailable) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Selected time slot ${data.timeSlot} is not within available slots on ${dayOfWeek}!`,
      );
    }
  }

  const result = await prisma.booking.create({
    data: {
      technicianId: data.technicianId,
      serviceId: data.serviceId,
      scheduleDate: bookingDate,
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
    data: { status: BookingStatus.CANCELLED },
  });

  return result;
};

export const bookingService = {
  createBookingIntoDB,
  getMyBookingsFromDB,
  getSingleBookingFromDB,
  cancelBookingFromDB,
};
