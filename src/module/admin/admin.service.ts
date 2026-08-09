import { ActiveStatus, Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";

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
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Invalid status! Use ACTIVE or BLOCKED",
    );
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  if (user.role === Role.ADMIN) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You cannot block or unblock an admin user!",
    );
  }

  const result = await prisma.user.update({
    where: { id: userId },
    data: { activeStatus },
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

const getDashboardStatsFromDB = async () => {
  const [
    userRoleCounts,
    serviceCount,
    categoryCount,
    bookingStatusCounts,
    revenueAgg,
    recentBookings,
    recentUsers,
  ] = await Promise.all([
    prisma.user.groupBy({
      by: ["role"],
      _count: { _all: true },
    }),
    prisma.service.count(),
    prisma.category.count(),
    prisma.booking.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.payment.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true },
    }),
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        technician: { select: { id: true, name: true, email: true } },
        service: { select: { id: true, name: true, price: true } },
      },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        activeStatus: true,
        createdAt: true,
      },
    }),
  ]);

  const roleCount = (role: string) =>
    userRoleCounts.find((item) => item.role === role)?._count._all ?? 0;

  const statusCount = (status: string) =>
    bookingStatusCounts.find((item) => item.status === status)?._count._all ??
    0;

  return {
    totals: {
      users: userRoleCounts.reduce((sum, item) => sum + item._count._all, 0),
      customers: roleCount("CUSTOMER"),
      technicians: roleCount("TECHNICIAN"),
      admins: roleCount("ADMIN"),
      services: serviceCount,
      categories: categoryCount,
      bookings: bookingStatusCounts.reduce(
        (sum, item) => sum + item._count._all,
        0,
      ),
      revenue: Number(revenueAgg._sum.amount ?? 0),
    },
    bookingStatusCounts: {
      REQUESTED: statusCount("REQUESTED"),
      ACCEPTED: statusCount("ACCEPTED"),
      DECLINED: statusCount("DECLINED"),
      CANCELLED: statusCount("CANCELLED"),
      PAID: statusCount("PAID"),
      IN_PROGRESS: statusCount("IN_PROGRESS"),
      COMPLETED: statusCount("COMPLETED"),
    },
    recentBookings,
    recentUsers,
  };
};

const getAllContactMessagesFromDB = async () => {
  const result = await prisma.contactMessage.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return result;
};

export const adminService = {
  getAllUsersFromDB,
  updateUserStatusIntoDB,
  getAllBookingsFromDB,
  getDashboardStatsFromDB,
  getAllContactMessagesFromDB,
};
