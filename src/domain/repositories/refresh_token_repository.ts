import { RefreshToken } from "../aggregates/refresh_token";
import { RefreshTokenID } from "../value_objects/token_id";
import { UserID } from "../value_objects/user_id";

export interface RefreshTokenRepository {
  existsByUserID(userID: UserID): Promise<boolean>;
  revokeToken(userID: UserID): Promise<void>;
  nextIdentity(): Promise<RefreshTokenID>;
  save(token: RefreshToken): Promise<void>;
}

export const REFRESH_TOKEN_REPOSITORY_TOKEN = Symbol.for(
  "RefreshTokenRepository",
);
