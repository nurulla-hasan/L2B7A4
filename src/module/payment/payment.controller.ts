import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { paymentService } from "./payment.service";
import httpStatus from "http-status";
import config from "../../config";

const createPayment = catchAsync(async (req, res) => {
  const result = await paymentService.createPaymentIntoDB(
    req.user?.id as string,
    req.body,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Payment initiated successfully",
    data: result,
  });
});

const paymentSuccess = catchAsync(async (req, res) => {
  const { tranId, val_id } = req.query;

  if (!tranId) {
    res.redirect(`${config.app_url}/payment/failed`);
    return;
  }

  await paymentService.paymentSuccessIntoDB(tranId as string, val_id as string | undefined);

  // Redirect to frontend success page
  res.redirect(`${config.app_url}/payment/success`);
});

const paymentFail = catchAsync(async (req, res) => {
  const { tranId } = req.query;

  if (tranId) {
    await paymentService.paymentFailIntoDB(tranId as string);
  }

  res.redirect(`${config.app_url}/payment/failed`);
});

const paymentCancel = catchAsync(async (req, res) => {
  const { tranId } = req.query;

  if (tranId) {
    await paymentService.paymentFailIntoDB(tranId as string);
  }

  res.redirect(`${config.app_url}/payment/cancelled`);
});

const paymentIpn = catchAsync(async (req, res) => {
  await paymentService.paymentIpnIntoDB(req.body);
  res.status(httpStatus.OK).json({ message: "IPN received" });
});

const getMyPayments = catchAsync(async (req, res) => {
  const result = await paymentService.getMyPaymentsFromDB(
    req.user?.id as string,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payments retrieved successfully",
    data: result,
  });
});

const getSinglePayment = catchAsync(async (req, res) => {
  const result = await paymentService.getSinglePaymentFromDB(
    req.params.id as string,
    req.user?.id as string,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment retrieved successfully",
    data: result,
  });
});

export const paymentController = {
  createPayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  paymentIpn,
  getMyPayments,
  getSinglePayment,
};
