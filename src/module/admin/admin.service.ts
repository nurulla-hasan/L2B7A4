import { ActiveStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const getAllUsersFromDB = async () => {
  const result = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      activeStatus: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return result;
};

const updateUserStatusIntoDB = async (
  userId: string,
  activeStatus: ActiveStatus,
) => {
  if (!Object.values(ActiveStatus).includes(activeStatus)) {
    throw new Error("Invalid status! Use ACTIVE or BLOCKED");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found!");
  }

  const result = await prisma.user.update({
    where: { id: userId },
    data: { activeStatus: activeStatus },
  });

  return result;
};

const getAllBookingsFromDB = async () => {
  const result = await prisma.booking.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      customer: {
        select: { id: true, name: true, email: true },
      },
      technician: {
        select: { id: true, name: true, email: true },
      },
      service: {
        select: { id: true, name: true, price: true },
      },
    },
  });
  return result;
};

export const adminService = {
  getAllUsersFromDB,
  updateUserStatusIntoDB,
  getAllBookingsFromDB,
};
