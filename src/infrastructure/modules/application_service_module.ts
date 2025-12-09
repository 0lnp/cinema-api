import { Module } from "@nestjs/common";
import { RepositoryModule } from "./repository_module";
import { PortsModule } from "./ports_module";
import { UserRegisterApplicationService } from "src/application/services/user_register_application_service";
import { UserLoginApplicationService } from "src/application/services/user_login_application_service";
import { RefreshTokenApplicationService } from "src/application/services/refresh_token_application_service";
import { DomainServiceModule } from "./domain_service_module";

@Module({
  imports: [RepositoryModule, PortsModule, DomainServiceModule],
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
  ],
  exports: [
    UserRegisterApplicationService.name,
    UserLoginApplicationService.name,
    RefreshTokenApplicationService.name,
  ],
})
export class ApplicationServiceModule {}
