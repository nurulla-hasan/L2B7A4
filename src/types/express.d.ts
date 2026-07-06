import type { Role, ActiveStatus } from "../../generated/prisma/client";

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        name: string;
        email: string;
        role: Role;
        activeStatus: ActiveStatus;
      };
    }
  }
}
