import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { bookingService } from "./booking.service";
import httpStatus from "http-status";

const createBooking = catchAsync(async (req, res) => {
  const result = await bookingService.createBookingIntoDB(
    req.user?.id as string,
    req.body,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Booking created successfully",
    data: result,
  });
});

const getMyBookings = catchAsync(async (req, res) => {
  const result = await bookingService.getMyBookingsFromDB(
    req.user?.id as string,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Bookings retrieved successfully",
    data: result,
  });
});

const getSingleBooking = catchAsync(async (req, res) => {
  const result = await bookingService.getSingleBookingFromDB(
    req.params.id as string,
    req.user?.id as string,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Booking retrieved successfully",
    data: result,
  });
});

export const bookingController = {
  createBooking,
  getMyBookings,
  getSingleBooking,
};
