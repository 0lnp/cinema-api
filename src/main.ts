import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./infrastructure/modules/app_module";
import { ConfigService } from "@nestjs/config";
import { AppConfig } from "./infrastructure/configs/app_config";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService<AppConfig, true>);
  const port = config.get("APP_PORT", { infer: true });
  await app.listen(port);
}
bootstrap();
