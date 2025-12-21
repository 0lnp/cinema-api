import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppConfigSchema } from "../configs/app_config";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { ControllerModule } from "./controller_module";
import { GlobalExceptionFilter } from "../http/filters/global_exception_filter";
import { RequestLoggerMiddleware } from "../http/middlewares/request_logger_middleware";
import { JobModule } from "./job_module";
import { EventModule } from "./event_module";
import { StatusCodeInterceptor } from "src/infrastructure/http/interceptors/status_code_interceptor";

@Module({
  imports: [
    ConfigModule.forRoot({
      validate(config: Record<string, unknown>) {
        return AppConfigSchema.parse(config);
      },
      isGlobal: true,
    }),
    EventModule,
    JobModule,
    ControllerModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: StatusCodeInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes("/");
  }
}
