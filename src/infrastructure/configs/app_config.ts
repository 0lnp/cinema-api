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

  XENDIT_API_KEY: z.string(),
  XENDIT_WEBHOOK_TOKEN: z.string(),
  XENDIT_BASE_URL: z.url().default("https://api.xendit.co"),
  XENDIT_REQUEST_TIMEOUT_MS: z.coerce.number().default(30000),
  PAYMENT_SUCCESS_REDIRECT_URL: z.url(),
  PAYMENT_FAILURE_REDIRECT_URL: z.url(),

  MINIO_ENDPOINT: z.string().default("localhost"),
  MINIO_PORT: z.coerce.number().default(9000),
  MINIO_ACCESS_KEY: z.string(),
  MINIO_SECRET_KEY: z.string(),
  MINIO_BUCKET_NAME: z.string().default("booking-assets"),
  MINIO_USE_SSL: z.coerce.boolean().default(false),

  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string(),
  SMTP_PASSWORD: z.string(),
  SMTP_FROM_ADDRESS: z.email(),
  SMTP_FROM_NAME: z.string().default("Cinema Booking"),

  SERVICE_FEE_AMOUNT_IDR: z.coerce.number().min(0).default(2000),
  SEAT_HOLD_UNTIL_MS: z.coerce
    .number()
    .min(0)
    .default(15 * 60 * 1000),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;
