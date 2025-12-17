import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AppConfig } from "../configs/app_config";
import { MovieStatusProcessor } from "../jobs/processors/movie_status_processor";
import { TokenCleanupProcessor } from "../jobs/processors/token_cleanup_processor";
import { JobSchedulerService } from "../jobs/job_scheduler_service";
import { RepositoryModule } from "./repository_module";
import { ShowtimeEventHandler } from "src/application/event_handlers/showtime_event_handler";

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService<AppConfig, true>) => ({
        connection: {
          host: config.get("BULLMQ_REDIS_HOST", { infer: true }),
          port: config.get("BULLMQ_REDIS_PORT", { infer: true }),
          password: config.get("BULLMQ_REDIS_PASSWORD", { infer: true }),
          db: config.get("BULLMQ_REDIS_DATABASE", { infer: true }),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: "movie-status" },
      { name: "token-cleanup" },
    ),
    RepositoryModule,
  ],
  providers: [
    MovieStatusProcessor,
    TokenCleanupProcessor,
    JobSchedulerService,
    ShowtimeEventHandler,
  ],
  exports: [BullModule],
})
export class JobModule {}
