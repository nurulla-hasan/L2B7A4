import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { authService } from "./auth.service";
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

const getMe = catchAsync(async (req, res) => {
  const result = await authService.getMeFromDB(req.user.id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User retrieved successfully",
    data: result,
  });
});


export const authController = {
  loginUser,
  registerUser,
  getMe
};