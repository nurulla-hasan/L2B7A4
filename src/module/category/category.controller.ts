import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { categoryServices } from "./category.service";


const getAllCategories = catchAsync(async (req, res) => {
    const result = await categoryServices.getAllCategoriesFromDB();
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Categories retrieved successfully",
        data: result,
    });
});

const createCategory = catchAsync(async (req, res) => {
    const result = await categoryServices.createCategoryIntoDB(req.body.name);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Category created successfully",
        data: result,
    });
});


export const categoryController = {
    getAllCategories,
    createCategory
}