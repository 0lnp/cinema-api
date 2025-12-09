import * as z from "zod";

export const AppConfigSchema = z.object({
  APP_PORT: z.coerce.number().default(3000),

  DATABASE_HOST: z.string().default("localhost"),
  DATABASE_PORT: z.coerce.number().default(5432),
  DATABASE_USER: z.string().default("postgres"),
  DATABASE_PASSWORD: z.string(),
  DATABASE_NAME: z.string().default("cinema_api"),

  JWT_ACCESS_TOKEN_SECRET: z.string().min(20),
  JWT_ACCESS_TOKEN_LIFETIME: z.string().default("15m"),
  JWT_REFRESH_TOKEN_SECRET: z.string().min(20),
  JWT_REFRESH_TOKEN_LIFETIME: z.string().default("7d"),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;
