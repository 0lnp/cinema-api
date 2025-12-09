import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppConfigSchema } from "../configs/app_config";
import { APP_FILTER } from "@nestjs/core";
import { GlobalExceptionFilter } from "src/presentation/filters/global_exception_filter";
import { AuthModule } from "./auth_module";

@Module({
  imports: [
    ConfigModule.forRoot({
      validate(config: Record<string, unknown>) {
        return AppConfigSchema.parse(config);
      },
      isGlobal: true,
    }),
    AuthModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
