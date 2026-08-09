import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { reviewService } from "./review.service";
import httpStatus from "http-status";

const createReview = catchAsync(async (req, res) => {
  const result = await reviewService.createReviewIntoDB(
    req.user?.id as string,
    req.body,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Review created successfully",
    data: result,
  });
});

const getPublicReviews = catchAsync(async (req, res) => {
  const result = await reviewService.getPublicReviewsFromDB();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Public reviews retrieved successfully",
    data: result,
  });
});

const getReviewsByService = catchAsync(async (req, res) => {
  const result = await reviewService.getReviewsByServiceFromDB(
    req.params.serviceId as string,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Reviews retrieved successfully",
    data: result,
  });
});

export const reviewController = {
  createReview,
  getReviewsByService,
  getPublicReviews,
};
