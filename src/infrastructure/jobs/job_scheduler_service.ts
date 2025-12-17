import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";

@Injectable()
export class JobSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(JobSchedulerService.name);

  public constructor(
    @InjectQueue("token-cleanup")
    private readonly tokenCleanupQueue: Queue,
  ) {}

  public async onModuleInit(): Promise<void> {
    await this.scheduleTokenCleanup();
  }

  private async scheduleTokenCleanup(): Promise<void> {
    const existingJobs = await this.tokenCleanupQueue.getJobSchedulers();
    for (const job of existingJobs) {
      await this.tokenCleanupQueue.removeJobScheduler(job.key);
    }

    await this.tokenCleanupQueue.add(
      "cleanup-expired-tokens",
      {},
      {
        repeat: {
          pattern: "0 0 * * *",
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    this.logger.log("Scheduled token cleanup job to run daily at midnight");
  }
}
