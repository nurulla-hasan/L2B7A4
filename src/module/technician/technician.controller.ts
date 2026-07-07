import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { technicianService } from "./technician.service";
import httpStatus from "http-status";

const getAllTechnicians = catchAsync(async (req, res) => {
  const result = await technicianService.getAllTechniciansFromDB();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Technicians retrieved successfully",
    data: result,
  });
});

const getSingleTechnician = catchAsync(async (req, res) => {
  const result = await technicianService.getSingleTechnicianFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Technician retrieved successfully",
    data: result,
  });
});

const updateProfile = catchAsync(async (req, res) => {
  const result = await technicianService.updateProfileIntoDB(
    req.user?.id as string,
    req.body,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Profile updated successfully",
    data: result,
  });
});

const updateAvailability = catchAsync(async (req, res) => {
  const result = await technicianService.updateAvailabilityIntoDB(
    req.user?.id as string,
    req.body,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Availability updated successfully",
    data: result,
  });
});

const getMyBookings = catchAsync(async (req, res) => {
  const result = await technicianService.getMyBookingsFromDB(
    req.user?.id as string,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Bookings retrieved successfully",
    data: result,
  });
});

const updateBookingStatus = catchAsync(async (req, res) => {
  const result = await technicianService.updateBookingStatusFromDB(
    req.user?.id as string,
    req.params.id as string,
    req.body.status,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Booking status updated successfully",
    data: result,
  });
});

export const technicianController = {
  getAllTechnicians,
  getSingleTechnician,
  updateProfile,
  updateAvailability,
  getMyBookings,
  updateBookingStatus,
};
