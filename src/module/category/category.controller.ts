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


const updateCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const result = await categoryServices.updateCategoryIntoDB(id as string, name);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Category updated successfully",
    data: result,
  });
});

const deleteCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await categoryServices.deleteCategoryFromDB(id as string);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Category deleted successfully",
    data: result,
  });
});


export const categoryController = {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
}