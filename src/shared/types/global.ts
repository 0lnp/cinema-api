import { User } from "src/domain/aggregates/user";

declare global {
  namespace Express {
    interface Request {
      user: User;
      accessToken: string;
      requestID: string;
    }
  }
}
