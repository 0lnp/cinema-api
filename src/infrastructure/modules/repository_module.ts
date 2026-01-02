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
import { EventRepository } from "src/domain/repositories/event_repository";
import { TypeormEventRepository } from "../persistences/typeorm_event_repository";
import { EventORMEntity } from "../databases/orm_entities/event_orm_entity";
import { ShowtimeRepository } from "src/domain/repositories/showtime_repository";
import { TypeormShowtimeRepository } from "../persistences/typeorm_showtime_repository";
import { ShowtimeORMEntity } from "../databases/orm_entities/showtime_orm_entity";
import { BookingRepository } from "src/domain/repositories/booking_repository";
import { TypeormBookingRepository } from "../persistences/typeorm_booking_repository";
import { BookingORMEntity } from "../databases/orm_entities/booking_orm_entity";
import { SeatInventoryRepository } from "src/domain/repositories/seat_inventory_repository";
import { TypeormSeatInventoryRepository } from "../persistences/typeorm_seat_inventory_repository";
import { SeatInventoryORMEntity } from "../databases/orm_entities/seat_inventory_orm_entity";
import { UserProfileRepository } from "src/domain/repositories/user_profile_repository";
import { TypeormUserProfileRepository } from "../persistences/typeorm_user_profile_repository";
import { UserProfileORMEntity } from "../databases/orm_entities/user_profile_orm_entity";
import { CategoryRepository } from "src/domain/repositories/category_repository";
import { TypeormCategoryRepository } from "../persistences/typeorm_category_repository";
import { CategoryORMEntity } from "../databases/orm_entities/category_orm_entity";

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
      EventORMEntity,
      ShowtimeORMEntity,
      BookingORMEntity,
      SeatInventoryORMEntity,
      UserProfileORMEntity,
      CategoryORMEntity,
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
    {
      provide: EventRepository.name,
      useClass: TypeormEventRepository,
    },
    {
      provide: ShowtimeRepository.name,
      useClass: TypeormShowtimeRepository,
    },
    {
      provide: BookingRepository.name,
      useClass: TypeormBookingRepository,
    },
    {
      provide: SeatInventoryRepository.name,
      useClass: TypeormSeatInventoryRepository,
    },
    {
      provide: UserProfileRepository.name,
      useClass: TypeormUserProfileRepository,
    },
    {
      provide: CategoryRepository.name,
      useClass: TypeormCategoryRepository,
    },
  ],
  exports: [
    UserRepository.name,
    RefreshTokenRepository.name,
    ScreenRepository.name,
    EventRepository.name,
    ShowtimeRepository.name,
    BookingRepository.name,
    SeatInventoryRepository.name,
    UserProfileRepository.name,
    CategoryRepository.name,
  ],
})
export class RepositoryModule {}
