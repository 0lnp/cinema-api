import { Module } from "@nestjs/common";
import { USER_REPOSITORY_TOKEN } from "src/domain/repositories/user_repository";
import { InMemoryUserRepository } from "../persistences/in_memory_user_repository";
import { REFRESH_TOKEN_REPOSITORY_TOKEN } from "src/domain/repositories/refresh_token_repository";
import { InMemoryRefreshTokenRepository } from "../persistences/in_memory_refresh_token_repository";

@Module({
  providers: [
    {
      provide: USER_REPOSITORY_TOKEN,
      useValue: new InMemoryUserRepository(),
    },
    {
      provide: REFRESH_TOKEN_REPOSITORY_TOKEN,
      useValue: new InMemoryRefreshTokenRepository(),
    },
  ],
  exports: [USER_REPOSITORY_TOKEN, REFRESH_TOKEN_REPOSITORY_TOKEN],
})
export class RepositoryModule {}
