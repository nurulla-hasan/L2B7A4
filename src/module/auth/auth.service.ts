import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { IGoogleLogin, ILoginUser, IRegisterUser } from "./auth.interface";
import { jwtUtils } from "../../utils/jwt";
import config from "../../config";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import {
  ActiveStatus,
  AuthProvider,
  Role,
} from "../../../generated/prisma/enums";
import { TokenPayload } from "google-auth-library";
import { googleCLient } from "../../lib/googleAuth";

const loginUserIntoDB = async (payload: ILoginUser) => {
  const { email, password } = payload;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.activeStatus === "BLOCKED") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Your account has been blocked. Please contact support.",
    );
  }

  // If the user registered via Google, they have no password — can't login with credentials
  if (!user.password) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "This account uses Google login. Please sign in with Google.",
    );
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Password is incorrect");
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in,
  );
  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in,
  );

  return { accessToken, refreshToken };
};

const registerUserIntoDB = async (payload: IRegisterUser) => {
  const { name, email, password, role } = payload;

  if (role !== "CUSTOMER" && role !== "TECHNICIAN") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Role must be either CUSTOMER or TECHNICIAN",
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError(httpStatus.CONFLICT, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
  });

  if (role === Role.TECHNICIAN) {
    await prisma.technicianProfile.create({
      data: {
        userId: user.id,
        skills: "",
        experience: "",
        pricing: 0,
      },
    });
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in,
  );
  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in,
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

const refreshTokenIntoDB = async (refreshToken: string) => {
  const validRefreshToken = jwtUtils.verifyToken(
    refreshToken,
    config.jwt_refresh_secret,
  );

  if (!validRefreshToken) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Refresh token is invalid");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: validRefreshToken.id,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  return {
    accessToken: jwtUtils.createToken(
      jwtPayload,
      config.jwt_access_secret,
      config.jwt_access_expires_in,
    ),
  };
};

const getMeFromDB = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      activeStatus: true,
      createdAt: true,
      updatedAt: true,
      technicianProfile: {
        select: {
          id: true,
          skills: true,
          experience: true,
          pricing: true,
          availability: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  return user;
};

const updateProfileIntoDB = async (
  userId: string,
  payload: { name?: string },
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  const result = await prisma.user.update({
    where: { id: userId },
    data: { name: payload.name },
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

const googleLoginIntoDB = async (payload: IGoogleLogin) => {
  let googleTokenPayload: TokenPayload | null | undefined = null;
  try {
    const ticket = await googleCLient.verifyIdToken({
      idToken: payload.idToken,
      audience: config.google_client_id,
    });

    googleTokenPayload = ticket.getPayload();
  } catch (error) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Google token is invalid");
  }
  if (!googleTokenPayload) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Google token is invalid");
  }

  if (!googleTokenPayload.email) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Google email not found");
  }
  if (!googleTokenPayload.name) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Google name not found");
  }

  // Step 1: Check if this Google account is already linked to any user by Google ID
  let user = await prisma.user.findUnique({
    where: {
      googleId: googleTokenPayload.sub, // sub = Google's unique user ID
    },
  });

  if (!user) {
    // Step 2: No user with this Google ID — look up by email (maybe an account exists via password/credential)
    const userByEmail = await prisma.user.findUnique({
      where: {
        email: googleTokenPayload.email,
      },
    });

    if (userByEmail) {
      // Step 2a: A credential account exists — check if it's blocked
      if (userByEmail.activeStatus === ActiveStatus.BLOCKED) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is blocked");
      }

      // Link the Google account: attach googleId and switch provider to GOOGLE
      user = await prisma.user.update({
        where: {
          id: userByEmail.id,
        },
        data: {
          googleId: googleTokenPayload.sub,
          authProvider: AuthProvider.GOOGLE,
        },
      });
    } else {
      // Step 2b: No account with this email either — create a brand new Google user
      user = await prisma.user.create({
        data: {
          name: googleTokenPayload.name,
          email: googleTokenPayload.email,
          role: Role.CUSTOMER,
          googleId: googleTokenPayload.sub,
          authProvider: AuthProvider.GOOGLE,
        },
      });
    }
  }

  // Safety check — user is guaranteed to exist at this point
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.activeStatus === ActiveStatus.BLOCKED) {
    throw new AppError(httpStatus.BAD_REQUEST, "User is blocked");
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in,
  );
  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in,
  );

  return { accessToken, refreshToken };
};

export const authService = {
  loginUserIntoDB,
  registerUserIntoDB,
  refreshTokenIntoDB,
  getMeFromDB,
  updateProfileIntoDB,
  googleLoginIntoDB,
};
