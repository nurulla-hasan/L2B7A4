import {
  PaymentProvider,
  PaymentStatus,
} from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { IConfirmPayment, ICreatePayment } from "./payment.interface";
import httpStatus from "http-status";

const createPaymentIntoDB = async (userId: string, data: ICreatePayment) => {
  const booking = await prisma.booking.findUnique({
    where: {
      id: data.bookingId,
    },
  });

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found!");
  }
  if (booking.status !== "ACCEPTED") {
    throw new AppError(httpStatus.BAD_REQUEST, "Booking is not accepted yet!");
  }

  if (booking.customerId !== userId) {
    throw new AppError(httpStatus.BAD_REQUEST, "This is not your booking!");
  }

  const existingPayment = await prisma.payment.findUnique({
    where: {
      bookingId: data.bookingId,
    },
  });

  if (existingPayment) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Payment already initiated for this booking!",
    );
  }

  const tranId = "SSLCZ_" + Date.now();

  const result = await prisma.payment.create({
    data: {
      bookingId: data.bookingId,
      amount: data.amount,
      method: data.method,
      provider: PaymentProvider.SSLCOMMERZ,
      transactionId: tranId,
      status: PaymentStatus.PENDING,
    },
  });

  return result;
};

const confirmPaymentIntoDB = async (userId: string, data: IConfirmPayment) => {
  const payment = await prisma.payment.findUnique({
    where: { bookingId: data.bookingId },
  });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment not found!");
  }
  if (payment.status === PaymentStatus.COMPLETED) {
    throw new AppError(httpStatus.BAD_REQUEST, "Payment already completed!");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: data.bookingId },
  });

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found!");
  }
  if (booking.customerId !== userId) {
    throw new AppError(httpStatus.BAD_REQUEST, "This is not your booking!");
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { bookingId: data.bookingId },
      data: {
        transactionId: data.transactionId,
        status: PaymentStatus.COMPLETED,
        paidAt: new Date(),
      },
    });

    await tx.booking.update({
      where: { id: data.bookingId },
      data: { status: "PAID" },
    });

    return updatedPayment;
  });

  return result;
};

const getMyPaymentsFromDB = async (userId: string) => {
  const result = await prisma.payment.findMany({
    where: {
      booking: {
        customerId: userId,
      },
    },
    include: {
      booking: {
        select: {
          id: true,
          scheduleDate: true,
          status: true,
          service: {
            select: {
              name: true,
              price: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

const getSinglePaymentFromDB = async (paymentId: string, userId: string) => {
  const result = await prisma.payment.findUnique({
    where: {
      id: paymentId,
    },
    include: {
      booking: {
        select: {
          id: true,
          scheduleDate: true,
          status: true,
          customerId: true,
          service: {
            select: {
              name: true,
              price: true,
            },
          },
        },
      },
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment not found!");
  }

  if (result.booking.customerId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, "This is not your payment!");
  }
  return result;
};

export const paymentService = {
  createPaymentIntoDB,
  confirmPaymentIntoDB,
  getMyPaymentsFromDB,
  getSinglePaymentFromDB,
};
