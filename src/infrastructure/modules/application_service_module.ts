import { Module } from "@nestjs/common";
import { RepositoryModule } from "./repository_module";
import { PortModule } from "./port_module";
import { UserRegisterApplicationService } from "src/application/services/user_register_application_service";
import { UserLoginApplicationService } from "src/application/services/user_login_application_service";
import { RefreshTokenApplicationService } from "src/application/services/refresh_token_application_service";
import { UserLogoutApplicationService } from "src/application/services/user_logout_application_service";

@Module({
  imports: [RepositoryModule, PortModule],
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
  ],
  exports: [
    UserRegisterApplicationService.name,
    UserLoginApplicationService.name,
    RefreshTokenApplicationService.name,
    UserLogoutApplicationService.name,
  ],
})
export class ApplicationServiceModule {}
