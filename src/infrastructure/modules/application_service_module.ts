import { Module } from "@nestjs/common";
import { RepositoryModule } from "./repository_module";
import { PortModule } from "./port_module";
import { UserRegisterApplicationService } from "src/application/services/user_register_application_service";
import { UserLoginApplicationService } from "src/application/services/user_login_application_service";
import { RefreshTokenApplicationService } from "src/application/services/refresh_token_application_service";
import { DomainServiceModule } from "./domain_service_module";
import { ScreenApplicationService } from "src/application/services/screen_application_service";
import { UserLogoutApplicationService } from "src/application/services/user_logout_application_service";
import { UserProfileApplicationService } from "src/application/services/user_profile_application_service";
import { MovieApplicationService } from "src/application/services/movie_application_service";
import { ShowtimeApplicationService } from "src/application/services/showtime_application_service";
import { BookingApplicationService } from "src/application/services/booking_application_service";
import { ProviderModule } from "./provider_module";
import { EventModule } from "./event_module";

@Module({
  imports: [
    RepositoryModule,
    PortModule,
    DomainServiceModule,
    ProviderModule,
    EventModule,
  ],
  providers: [
    {
      provide: UserRegisterApplicationService.name,
      useClass: UserRegisterApplicationService,
    },
    {
      provide: UserLoginApplicationService.name,
      useClass: UserLoginApplicationService,
    },
    {
      provide: RefreshTokenApplicationService.name,
      useClass: RefreshTokenApplicationService,
    },
    {
      provide: UserLogoutApplicationService.name,
      useClass: UserLogoutApplicationService,
    },
    {
      provide: UserProfileApplicationService.name,
      useClass: UserProfileApplicationService,
    },
    {
      provide: ScreenApplicationService.name,
      useClass: ScreenApplicationService,
    },
    {
      provide: MovieApplicationService.name,
      useClass: MovieApplicationService,
    },
    {
      provide: ShowtimeApplicationService.name,
      useClass: ShowtimeApplicationService,
    },
    {
      provide: BookingApplicationService.name,
      useClass: BookingApplicationService,
    },
  ],
  exports: [
    UserRegisterApplicationService.name,
    UserLoginApplicationService.name,
    RefreshTokenApplicationService.name,
    ScreenApplicationService.name,
    UserLogoutApplicationService.name,
    UserProfileApplicationService.name,
    MovieApplicationService.name,
    ShowtimeApplicationService.name,
    BookingApplicationService.name,
  ],
})
export class ApplicationServiceModule {}
