import { Module } from "@nestjs/common";
import { RedisClient } from "../instances/redis_client";
import { ConfigService } from "@nestjs/config";
import { AppConfig } from "../configs/app_config";

@Module({
  providers: [
    {
      provide: RedisClient.name,
      async useFactory(config: ConfigService<AppConfig, true>) {
        return await RedisClient.create(config);
      },
      inject: [ConfigService],
    },
  ],
  exports: [RedisClient.name],
})
export class InfraModule {}
