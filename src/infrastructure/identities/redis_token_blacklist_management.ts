import { TokenBlacklistManager } from "src/domain/ports/token_blacklist_manager";
import { UserID } from "src/domain/value_objects/user_id";
import { RedisClient } from "../instances/redis_client";
import { Inject } from "@nestjs/common";

export class RedisTokenBlacklistManager extends TokenBlacklistManager {
  public constructor(
    @Inject(RedisClient.name)
    private readonly redisClient: RedisClient,
  ) {
    super();
  }

  public async blacklist(
    tokenHash: string,
    userID: UserID,
    expiresAt: Date,
  ): Promise<void> {
    const key = TokenBlacklistManager.TOKEN_PREFIX + tokenHash;

    const nowInSeconds = Math.floor(Date.now() / 1000);
    const expiresAtSeconds = Math.floor(expiresAt.getTime() / 1000);
    const ttlSeconds = expiresAtSeconds - nowInSeconds;

    await this.redisClient.set(key, userID.value, ttlSeconds);
  }

  public async isBlacklisted(tokenHash: string): Promise<boolean> {
    const key = TokenBlacklistManager.TOKEN_PREFIX + tokenHash;
    return await this.redisClient.exists(key);
  }
}
