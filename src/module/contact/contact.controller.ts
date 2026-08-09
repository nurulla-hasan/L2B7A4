import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { contactService } from "./contact.service";
import httpStatus from "http-status";

const createMessage = catchAsync(async (req, res) => {
  const result = await contactService.createMessageIntoDB(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Message sent successfully",
    data: result,
  });
});

export const contactController = {
  createMessage,
};
