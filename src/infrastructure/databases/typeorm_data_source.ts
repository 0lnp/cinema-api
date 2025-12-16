import { type ConfigService } from "@nestjs/config";
import { type AppConfig } from "../configs/app_config";
import { DataSource, type DataSourceOptions } from "typeorm";
import { UserORMEntity } from "./orm_entities/user_orm_entity";
import { RefreshTokenORMEntity } from "./orm_entities/refresh_token_orm_entity";
import { ScreenORMEntity } from "./orm_entities/screen_orm_entity";
import { MovieORMEntity } from "./orm_entities/movie_orm_entity";
import { ShowtimeORMEntity } from "./orm_entities/showtime_orm_entity";

export const typeORMDataSourceOptions = (
  config: ConfigService<AppConfig, true>,
): DataSourceOptions => ({
  type: "postgres",
  host: config.get("DATABASE_HOST", { infer: true }),
  port: config.get("DATABASE_PORT", { infer: true }),
  username: config.get("DATABASE_USER", { infer: true }),
  password: config.get("DATABASE_PASSWORD", { infer: true }),
  database: config.get("DATABASE_NAME", { infer: true }),
  entities: [
    UserORMEntity,
    RefreshTokenORMEntity,
    ScreenORMEntity,
    MovieORMEntity,
    ShowtimeORMEntity,
  ],
});

export default new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT || "5432", 10),
  username: process.env.DATABASE_USER || "postgres",
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME || "cinema_db",
  entities: [
    UserORMEntity,
    RefreshTokenORMEntity,
    ScreenORMEntity,
    MovieORMEntity,
    ShowtimeORMEntity,
  ],
  migrations: ["migrations/*.ts"],
  synchronize: false,
});
