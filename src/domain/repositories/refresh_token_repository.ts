import { type RefreshToken } from "../aggregates/refresh_token";
import { type TokenID } from "../value_objects/token_id";

export abstract class RefreshTokenRepository {
  public abstract nextIdentity(): Promise<TokenID>;
  public abstract nextFamily(): Promise<TokenID>;
  public abstract tokenOfHash(hash: string): Promise<RefreshToken | null>;
  public abstract revokeByFamily(family: TokenID): Promise<void>;
  public abstract save(token: RefreshToken): Promise<void>;
  public abstract deleteExpiredTokens(olderThan: Date): Promise<number>;
}
