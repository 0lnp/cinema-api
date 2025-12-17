import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Job } from "bullmq";
import { RefreshTokenRepository } from "src/domain/repositories/refresh_token_repository";
import { AppConfig } from "src/infrastructure/configs/app_config";

@Processor("token-cleanup")
export class TokenCleanupProcessor extends WorkerHost {
  private readonly logger = new Logger(TokenCleanupProcessor.name);

  public constructor(
    @Inject(RefreshTokenRepository.name)
    private readonly refreshTokenRepository: RefreshTokenRepository,
    @Inject(ConfigService)
    private readonly config: ConfigService<AppConfig, true>,
  ) {
    super();
  }

  public async process(job: Job): Promise<void> {
    this.logger.log(`Processing token cleanup job ${job.id}`);

    switch (job.name) {
      case "cleanup-expired-tokens":
        await this.handleCleanupExpiredTokens();
        break;
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  private async handleCleanupExpiredTokens(): Promise<void> {
    const lifetime = this.config.get("JWT_REFRESH_TOKEN_LIFETIME", {
      infer: true,
    });
    const days = this.parseLifetimeToDays(lifetime);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    this.logger.log(
      `Cleaning up refresh tokens older than ${cutoffDate.toISOString()}`,
    );

    const deletedCount = await this.refreshTokenRepository.deleteExpiredTokens(
      cutoffDate,
    );

    this.logger.log(`Deleted ${deletedCount} expired refresh tokens`);
  }

  private parseLifetimeToDays(lifetime: string): number {
    const match = lifetime.match(/^(\d+)([dhms])$/);
    if (!match) {
      this.logger.warn(
        `Invalid lifetime format: ${lifetime}, defaulting to 7 days`,
      );
      return 7;
    }

    const value = parseInt(match[1]!, 10);
    const unit = match[2];

    switch (unit) {
      case "d":
        return value;
      case "h":
        return value / 24;
      case "m":
        return value / (24 * 60);
      case "s":
        return value / (24 * 60 * 60);
      default:
        return 7;
    }
  }
}
