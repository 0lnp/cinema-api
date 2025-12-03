import { randomUUID } from "node:crypto";
import { RefreshToken } from "src/domain/aggregates/refresh_token";
import { RefreshTokenRepository } from "src/domain/repositories/refresh_token_repository";
import { RefreshTokenID } from "src/domain/value_objects/token_id";
import { UserID } from "src/domain/value_objects/user_id";

export class InMemoryRefreshTokenRepository implements RefreshTokenRepository {
  private refreshTokens: RefreshToken[] = [];

  public async existsByUserID(userID: UserID): Promise<boolean> {
    const exists = this.refreshTokens.some(
      (token) => token.userID.value === userID.value,
    );
    return Promise.resolve(exists);
  }

  public async revokeToken(userID: UserID): Promise<void> {
    const revokedTokenIndex = this.refreshTokens.findIndex(
      (token) => token.userID.value === userID.value,
    );
    if (revokedTokenIndex !== -1) {
      this.refreshTokens.splice(revokedTokenIndex, 1);
    }
  }

  public async save(refreshToken: RefreshToken): Promise<void> {
    this.refreshTokens.push(refreshToken);
  }

  public async nextIdentity(): Promise<RefreshTokenID> {
    const id = `refresh_token_${randomUUID()}`;
    return Promise.resolve(new RefreshTokenID(id));
  }
}
