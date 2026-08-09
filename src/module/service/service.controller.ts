import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { serviceServices } from "./service.service";
import httpStatus from "http-status";

const getAllService = catchAsync(async (req, res) => {
  const result = await serviceServices.getAllServicesFromDB(
    req.query as Record<string, unknown>,
  );

  // Handle both old format (array) and new format ({ data, meta })
  if (Array.isArray(result)) {
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Services retrieved successfully",
      data: result,
    });
  } else {
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Services retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }
});

const getRelatedServices = catchAsync(async (req, res) => {
  const result = await serviceServices.getRelatedServicesFromDB(
    req.params.id as string,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Related services retrieved successfully",
    data: result,
  });
});

const getSingleService = catchAsync(async (req, res) => {
  const result = await serviceServices.getSingleServiceFromDB(
    req.params.id as string,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Service retrieved successfully",
    data: result,
  });
});

const createService = catchAsync(async (req, res) => {
  const result = await serviceServices.createServiceIntoDB(
    req.user?.id as string,
    req.body,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Service created successfully",
    data: result,
  });
});

const updateService = catchAsync(async (req, res) => {
  const result = await serviceServices.updateServiceFromDB(
    req.user?.id as string,
    req.params.id as string,
    req.body,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Service updated successfully",
    data: result,
  });
});

const deleteService = catchAsync(async (req, res) => {
  const result = await serviceServices.deleteServiceFromDB(
    req.user?.id as string,
    req.params.id as string,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Service deleted successfully",
    data: result,
  });
});

const getMyServices = catchAsync(async (req, res) => {
  const result = await serviceServices.getMyServicesFromDB(
    req.user?.id as string,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Your services retrieved successfully",
    data: result,
  });
});

export const serviceController = {
  getAllService,
  getSingleService,
  createService,
  updateService,
  deleteService,
  getMyServices,
  getRelatedServices,
};
