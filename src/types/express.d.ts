import { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {

      user?: {
        uuid: string;
        sessionUuid: string;
        email: string;
        role: string;

      };

    }

    interface User {
      uuid?: string;
      sessionUuid?: string;
      email: string;
      role: string;
    }
  }
}