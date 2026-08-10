import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { authService } from "./auth.service";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";

const loginUser = catchAsync(async (req, res) => {
  const result = await authService.loginUserIntoDB(req.body);

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });

  res.cookie("accessToken", result.accessToken, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Login successful",
    data: {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    },
  });
});

const registerUser = catchAsync(async (req, res) => {
  
  const result = await authService.registerUserIntoDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User created successfully",
    data: result,
  });

})

const refreshToken = catchAsync(async (req, res) => {
  const token = req.cookies?.refreshToken ?? req.body.refreshToken;

  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Refresh token is missing!");
  }

  const result = await authService.refreshTokenIntoDB(token);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Access token refreshed successfully",
    data: result,
  });
});

const getMe = catchAsync(async (req, res) => {
  const result = await authService.getMeFromDB(req.user.id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User retrieved successfully",
    data: result,
  });
});

const updateProfile = catchAsync(async (req, res) => {
  const result = await authService.updateProfileIntoDB(req.user.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Profile updated successfully",
    data: result,
  });
});

export const authController = {
  loginUser,
  registerUser,
  refreshToken,
  getMe,
  updateProfile,
};