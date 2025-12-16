import { UserID } from "../value_objects/user_id";

export abstract class TokenBlacklistManager {
  protected static readonly TOKEN_PREFIX = "blacklist:token:";

  public abstract blacklist(
    tokenHash: string,
    userID: UserID,
    expiresAt: Date,
  ): Promise<void>;
  public abstract isBlacklisted(tokenHash: string): Promise<boolean>;
}
