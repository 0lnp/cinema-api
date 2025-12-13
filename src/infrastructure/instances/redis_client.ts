import { ConfigService } from "@nestjs/config";
import { Logger } from "@nestjs/common";
import { createClient, RedisClientType } from "redis";
import { AppConfig } from "../configs/app_config";
import {
  InfrastructureError,
  InfrastructureErrorCode,
} from "src/shared/exceptions/infrastructure_error";

export class RedisClient {
  private client: RedisClientType | null = null;
  private readonly logger = new Logger(RedisClient.name);

  public static async create(
    config: ConfigService<AppConfig, true>,
  ): Promise<RedisClient> {
    const instance = new RedisClient();

    const url = `redis://${config.get("REDIS_HOST", { infer: true })}:${config.get("REDIS_PORT", { infer: true })}`;

    instance.client = createClient({
      url,
      password: config.get("REDIS_PASSWORD", { infer: true }),
      database: config.get("REDIS_DATABASE", { infer: true }),
    });

    instance.client.on("error", (error: Error) => {
      instance.logger.error("[REDIS ERROR]:", error.message);
    });

    await instance.client.connect();
    instance.logger.log("[REDIS] Connected");

    return instance;
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      this.logger.log("[REDIS] Disconnected");
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      if (!this.client) return false;
      await this.client.ping();
      return true;
    } catch {
      return false;
    }
  }

  private ensureConnected(): void {
    if (!this.client) {
      throw new InfrastructureError({
        code: InfrastructureErrorCode.REDIS_CONNECTION_FAILED,
        message: "Redis client not connected",
      });
    }
  }

  public async get(key: string): Promise<string | null> {
    if (!key) throw new Error("Key is required");
    this.ensureConnected();
    return await this.client!.get(key);
  }

  public async set(
    key: string,
    value: string,
    ttlSeconds?: number,
  ): Promise<void> {
    if (!key) throw new Error("Key is required");
    this.ensureConnected();

    if (ttlSeconds) {
      await this.client!.setEx(key, ttlSeconds, value);
    } else {
      await this.client!.set(key, value);
    }
  }

  public async del(key: string): Promise<number> {
    if (!key) throw new Error("Key is required");
    this.ensureConnected();
    return await this.client!.del(key);
  }

  public async exists(key: string): Promise<boolean> {
    if (!key) throw new Error("Key is required");
    this.ensureConnected();
    return (await this.client!.exists(key)) === 1;
  }
}
