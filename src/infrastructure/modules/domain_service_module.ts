import { Module } from "@nestjs/common";
import { SharedModule } from "./shared_module";
import {
  AUTHENTICATION_SERVICE_TOKEN,
  AuthenticationService,
} from "src/domain/services/authentication_service";
import {
  USER_REPOSITORY_TOKEN,
  UserRepository,
} from "src/domain/repositories/user_repository";
import {
  PASSWORD_HASHER_TOKEN,
  PasswordHasher,
} from "src/domain/ports/password_hasher";
import {
  TOKEN_GENERATOR_TOKEN,
  TokenGenerator,
} from "src/domain/ports/token_generator";
import { TOKEN_HASHER_TOKEN, TokenHasher } from "src/domain/ports/token_hasher";
import {
  REFRESH_TOKEN_REPOSITORY_TOKEN,
  RefreshTokenRepository,
} from "src/domain/repositories/refresh_token_repository";
import { RepositoryModule } from "./repository_module";

@Module({
  imports: [DomainServiceModule, RepositoryModule, SharedModule],
  providers: [
    {
      provide: AUTHENTICATION_SERVICE_TOKEN,
      useFactory(
        userRepository: UserRepository,
        passwordHasher: PasswordHasher,
        tokenGenerator: TokenGenerator,
        tokenHasher: TokenHasher,
        refreshTokenRepository: RefreshTokenRepository,
      ) {
        return new AuthenticationService(
          userRepository,
          passwordHasher,
          tokenGenerator,
          tokenHasher,
          refreshTokenRepository,
        );
      },
      inject: [
        USER_REPOSITORY_TOKEN,
        PASSWORD_HASHER_TOKEN,
        TOKEN_GENERATOR_TOKEN,
        TOKEN_HASHER_TOKEN,
        REFRESH_TOKEN_REPOSITORY_TOKEN,
      ],
    },
  ],
  exports: [AUTHENTICATION_SERVICE_TOKEN],
})
export class DomainServiceModule {}
