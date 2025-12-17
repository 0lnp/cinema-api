import * as z from "zod";

export const AppConfigSchema = z.object({
  APP_PORT: z.coerce.number().default(3000),

  DATABASE_HOST: z.string().default("localhost"),
  DATABASE_PORT: z.coerce.number().default(5432),
  DATABASE_USER: z.string().default("postgres"),
  DATABASE_PASSWORD: z.string(),
  DATABASE_NAME: z.string().default("cinema_db"),

  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().default(""),
  REDIS_DATABASE: z.coerce.number().default(0),

  BULLMQ_REDIS_HOST: z.string().default("localhost"),
  BULLMQ_REDIS_PORT: z.coerce.number().default(6379),
  BULLMQ_REDIS_PASSWORD: z.string().default(""),
  BULLMQ_REDIS_DATABASE: z.coerce.number().default(1),

  JWT_ACCESS_TOKEN_SECRET: z.string().min(20),
  JWT_ACCESS_TOKEN_LIFETIME: z.string().default("15m"),
  JWT_REFRESH_TOKEN_SECRET: z.string().min(20),
  JWT_REFRESH_TOKEN_LIFETIME: z.string().default("7d"),

  TMDB_API_ACCESS_KEY: z.string(),
  TMDB_API_BASE_URL: z.url(),
  TMDB_REQUEST_TIMEOUT_MS: z.coerce.number().default(10000),
  MOVIE_POSTER_BASE_URL: z.url(),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;
