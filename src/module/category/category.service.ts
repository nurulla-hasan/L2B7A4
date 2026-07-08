import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";


const getAllCategoriesFromDB = async () => {
    const categories = await prisma.category.findMany({
        orderBy: {
            name: "desc"
        }
    });

    return categories
}

const createCategoryIntoDB = async (categoryName : string) => {
    
    const result = await prisma.category.create({
        data : {
            name : categoryName
        }
    })

    return result
}

const updateCategoryIntoDB = async (id: string, name: string) => {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found!");
  }

  const result = await prisma.category.update({
    where: { id },
    data: { name },
  });

  return result;
};

const deleteCategoryFromDB = async (id: string) => {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found!");
  }

  // Check if any services use this category
  const servicesCount = await prisma.service.count({ where: { categoryId: id } });
  if (servicesCount > 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot delete category: ${servicesCount} service(s) are linked to it. Remove or reassign them first.`,
    );
  }

  await prisma.category.delete({ where: { id } });
  return { message: "Category deleted successfully" };
};

export const categoryServices = {
    getAllCategoriesFromDB,
    createCategoryIntoDB,
    updateCategoryIntoDB,
    deleteCategoryFromDB,
}