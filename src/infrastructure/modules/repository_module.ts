import { Module } from "@nestjs/common";
import { UserRepository } from "src/domain/repositories/user_repository";
import { TypeORMUserRepository } from "../persistences/typeorm_user_repository";
import { TypeORMRefreshTokenRepository } from "../persistences/typeorm_refresh_token_repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { type AppConfig } from "../configs/app_config";
import { RefreshTokenRepository } from "src/domain/repositories/refresh_token_repository";
import { typeORMDataSourceOptions } from "../databases/typeorm_data_source";
import { UserORMEntity } from "../databases/orm_entities/user_orm_entity";
import { RefreshTokenORMEntity } from "../databases/orm_entities/refresh_token_orm_entity";
import { ScreenRepository } from "src/domain/repositories/screen_repository";
import { TypeORMScreenRepository } from "../persistences/typeorm_screen_repository";
import { ScreenORMEntity } from "../databases/orm_entities/screen_orm_entity";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService<AppConfig, true>) => {
        return typeORMDataSourceOptions(config);
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      UserORMEntity,
      RefreshTokenORMEntity,
      ScreenORMEntity,
    ]),
  ],
  providers: [
    {
      provide: UserRepository.name,
      useClass: TypeORMUserRepository,
    },
    {
      provide: RefreshTokenRepository.name,
      useClass: TypeORMRefreshTokenRepository,
    },
    {
      provide: ScreenRepository.name,
      useClass: TypeORMScreenRepository,
    },
  ],
  exports: [
    UserRepository.name,
    RefreshTokenRepository.name,
    ScreenRepository.name,
  ],
})
export class RepositoryModule {}
