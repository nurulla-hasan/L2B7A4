import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { authService } from "./auth.service";
import httpStatus from "http-status";

const loginUser = catchAsync(async (req, res, next) => {
  const result = await authService.loginUserIntoDB(req.body);

  res.cookie("refreshToken", result.refreshToken, {
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


export const authController = {
  loginUser,
};