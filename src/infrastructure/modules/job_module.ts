import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AppConfig } from "../configs/app_config";
import { EventStatusProcessor } from "../jobs/processors/event_status_processor";
import { TokenCleanupProcessor } from "../jobs/processors/token_cleanup_processor";
import { BookingProcessor } from "../jobs/processors/booking_processor";
import { BookingExpirationProcessor } from "../jobs/processors/booking_expiration_processor";
import { JobSchedulerService } from "../jobs/job_scheduler_service";
import { RepositoryModule } from "./repository_module";
import { PortModule } from "./port_module";
import { ShowtimeEventHandler } from "src/application/event_handlers/showtime_event_handler";
import { BookingEventHandler } from "src/application/event_handlers/booking_event_handler";
import { EventModule } from "./event_module";

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
      { name: "event-status" },
      { name: "token-cleanup" },
      { name: "booking-processing" },
      { name: "booking-expiration" },
    ),
    RepositoryModule,
    PortModule,
    EventModule,
  ],
  providers: [
    EventStatusProcessor,
    TokenCleanupProcessor,
    BookingProcessor,
    BookingExpirationProcessor,
    JobSchedulerService,
    ShowtimeEventHandler,
    BookingEventHandler,
  ],
  exports: [BullModule],
})
export class JobModule {}
