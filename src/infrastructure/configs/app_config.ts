import { plainToInstance } from "class-transformer";
import { IsNumber, IsOptional, IsString, validateSync } from "class-validator";

export class AppConfig {
  @IsOptional()
  @IsString()
  APP_HOST: string = "localhost";
  @IsNumber()
  APP_PORT: number = 3000;

  @IsString()
  DATABASE_HOST!: string;
  @IsNumber()
  DATABASE_PORT!: number;
  @IsString()
  DATABASE_USER!: string;
  @IsString()
  DATABASE_PASSWORD!: string;
  @IsString()
  DATABASE_NAME!: string;

  @IsString()
  JWT_ACCESS_SECRET!: string;
  @IsString()
  JWT_ACCESS_LIFETIME: string = "15m";
  @IsString()
  JWT_REFRESH_SECRET!: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(AppConfig, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) throw new Error(errors.toString());
  return validatedConfig;
}
