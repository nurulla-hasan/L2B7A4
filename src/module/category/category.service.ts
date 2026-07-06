import { prisma } from "../../lib/prisma";


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

export const categoryServices = {
    getAllCategoriesFromDB,
    createCategoryIntoDB
}