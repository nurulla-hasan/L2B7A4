import { BookingStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { ICreateReview } from "./review.interface";
import httpStatus from "http-status";

const createReviewIntoDB = async (userId: string, data: ICreateReview) => {
  const booking = await prisma.booking.findUnique({
    where: {
      id: data.bookingId,
    },
  });

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found!");
  }
  if (booking.status !== BookingStatus.COMPLETED) {
    throw new AppError(httpStatus.BAD_REQUEST, "Booking is not completed yet!");
  }
  if (booking.customerId !== userId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You can only review your own bookings!",
    );
  }

  const existingReview = await prisma.review.findUnique({
    where: { bookingId: data.bookingId },
  });

  if (existingReview) {
    throw new AppError(
      httpStatus.CONFLICT,
      "You have already reviewed this booking!",
    );
  }

  if (data.rating < 1 || data.rating > 5) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Rating must be between 1 and 5!",
    );
  }

  const result = await prisma.review.create({
    data: {
      bookingId: data.bookingId,
      rating: data.rating,
      comment: data.comment,
    },
  });

  return result;
};

export const reviewService = {
  createReviewIntoDB,
};
