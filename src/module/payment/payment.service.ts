import {
  PaymentProvider,
  PaymentStatus,
} from "../../../generated/prisma/enums";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { ICreatePayment } from "./payment.interface";
import httpStatus from "http-status";
import SSLCommerzPayment from "sslcommerz-lts";

const createPaymentIntoDB = async (userId: string, data: ICreatePayment) => {
  const booking = await prisma.booking.findUnique({
    where: {
      id: data.bookingId,
    },
    include: {
      customer: {
        select: {
          name: true,
          email: true,
        },
      },
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

  const result = await prisma.$transaction(async (tx) => {

    await tx.payment.create({
      data: {
        bookingId: data.bookingId,
        amount: data.amount,
        method: "ONLINE",
        provider: PaymentProvider.SSLCOMMERZ,
        transactionId: tranId,
        status: PaymentStatus.PENDING,
      },
    });

    const sslcz = new SSLCommerzPayment(
      config.ssl_store_id,
      config.ssl_store_pass,
      false,
    );

    const sslData = {
      total_amount: Number(data.amount),
      currency: "BDT",
      tran_id: tranId,
      success_url: `${config.api_url}/api/payments/success?tranId=${tranId}`,
      fail_url: `${config.api_url}/api/payments/fail?tranId=${tranId}`,
      cancel_url: `${config.api_url}/api/payments/cancel?tranId=${tranId}`,
      ipn_url: `${config.api_url}/api/payments/ipn`,
      shipping_method: "NO",
      product_name: "Service Booking",
      product_category: "Service",
      product_profile: "general",
      cus_name: booking.customer?.name || "N/A",
      cus_email: booking.customer?.email || "N/A",
      cus_add1: "N/A",
      cus_city: "N/A",
      cus_state: "N/A",
      cus_postcode: "1000",
      cus_country: "Bangladesh",
      cus_phone: "N/A",
      cus_fax: "N/A",
      ship_name: booking.customer?.name || "N/A",
      ship_add1: "N/A",
      ship_city: "N/A",
      ship_state: "N/A",
      ship_postcode: "1000",
      ship_country: "Bangladesh",
    };

    const apiResponse = await sslcz.init(sslData);

    if (apiResponse.status !== "SUCCESS") {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "SSLCommerz payment initiation failed: " + (apiResponse.failedreason || JSON.stringify(apiResponse)),
      );
    }

    return {
      transactionId: tranId,
      amount: data.amount,
      paymentUrl: apiResponse.GatewayPageURL,
    };
  });

  return result;
};

const paymentSuccessIntoDB = async (tranId: string) => {
  const payment = await prisma.payment.findFirst({
    where: { transactionId: tranId },
  });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment not found!");
  }
  if (payment.status === PaymentStatus.COMPLETED) {
    return { message: "Payment already completed" };
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.COMPLETED,
        paidAt: new Date(),
      },
    });

    await tx.booking.update({
      where: { id: payment.bookingId },
      data: { status: "PAID" },
    });

    return updatedPayment;
  });

  return result;
};

const paymentFailIntoDB = async (tranId: string) => {
  const payment = await prisma.payment.findFirst({
    where: { transactionId: tranId },
  });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment not found!");
  }

  const result = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: PaymentStatus.FAILED,
    },
  });

  return result;
};

const paymentIpnIntoDB = async (ipnData: Record<string, any>) => {
  const { status, tran_id, val_id } = ipnData;

  if (!tran_id || !val_id) {
    console.error("[SSLCommerz IPN] Missing tran_id or val_id:", ipnData);
    return { message: "Invalid IPN data" };
  }

  // Validate with SSLCommerz API
  const validationUrl = `${config.ssl_base_url}/validator/api/validationserverAPI.php?val_id=${val_id}&store_id=${config.ssl_store_id}&store_passwd=${config.ssl_store_pass}&format=json`;

  try {
    const validationResponse = await fetch(validationUrl);
    const validationData = await validationResponse.json() as any;

    // Only update if SSLCommerz confirms the transaction is valid
    if (
      validationData.status === "VALID" ||
      validationData.status === "VALIDATED"
    ) {
      const payment = await prisma.payment.findFirst({
        where: { transactionId: tran_id },
      });

      if (!payment) {
        console.error(`[SSLCommerz IPN] Payment not found: ${tran_id}`);
        return { message: "Payment not found" };
      }

      if (payment.status === PaymentStatus.COMPLETED) {
        return { message: "Already completed" };
      }

      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.COMPLETED,
            paidAt: new Date(),
          },
        });

        await tx.booking.update({
          where: { id: payment.bookingId },
          data: { status: "PAID" },
        });
      });

      console.log(`[SSLCommerz IPN] Payment completed: ${tran_id}`);
      return { message: "Payment completed via IPN" };
    } else {
      // If validation fails, mark as failed
      const payment = await prisma.payment.findFirst({
        where: { transactionId: tran_id },
      });

      if (payment && payment.status === PaymentStatus.PENDING) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.FAILED },
        });
        console.log(`[SSLCommerz IPN] Payment failed via IPN: ${tran_id}`);
      }

      return { message: "Payment validation failed" };
    }
  } catch (error) {
    console.error("[SSLCommerz IPN] Validation error:", error);
    return { message: "IPN processing error" };
  }
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
  paymentSuccessIntoDB,
  paymentFailIntoDB,
  paymentIpnIntoDB,
  getMyPaymentsFromDB,
  getSinglePaymentFromDB,
};
