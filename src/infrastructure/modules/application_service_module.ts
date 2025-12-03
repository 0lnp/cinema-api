import { Module } from "@nestjs/common";
import {
  AUTHENTICATION_APPLICATION_SERVICE_TOKEN,
  AuthenticationApplicationService,
} from "src/application/services/authentication_application_service";
import { DomainServiceModule } from "./domain_service_module";
import { RepositoryModule } from "./repository_module";
import {
  AUTHENTICATION_SERVICE_TOKEN,
  AuthenticationService,
} from "src/domain/services/authentication_service";
import {
  USER_REPOSITORY_TOKEN,
  UserRepository,
} from "src/domain/repositories/user_repository";
import {
  REFRESH_TOKEN_REPOSITORY_TOKEN,
  RefreshTokenRepository,
} from "src/domain/repositories/refresh_token_repository";

@Module({
  imports: [DomainServiceModule, RepositoryModule],
  providers: [
    {
      provide: AUTHENTICATION_APPLICATION_SERVICE_TOKEN,
      useFactory(
        authenticationService: AuthenticationService,
        userRepository: UserRepository,
        refreshTokenRepository: RefreshTokenRepository,
      ) {
        return new AuthenticationApplicationService(
          authenticationService,
          userRepository,
          refreshTokenRepository,
        );
      },
      inject: [
        AUTHENTICATION_SERVICE_TOKEN,
        USER_REPOSITORY_TOKEN,
        REFRESH_TOKEN_REPOSITORY_TOKEN,
      ],
    },
  ],
  exports: [AUTHENTICATION_APPLICATION_SERVICE_TOKEN],
})
export class ApplicationServiceModule {}
