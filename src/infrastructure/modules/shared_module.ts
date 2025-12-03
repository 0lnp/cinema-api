import { Module } from "@nestjs/common";
import { PASSWORD_HASHER_TOKEN } from "src/domain/ports/password_hasher";
import { BcryptPasswordHasher } from "../securities/bcrypt_password_hasher";
import { TOKEN_GENERATOR_TOKEN } from "src/domain/ports/token_generator";
import { JoseTokenGenerator } from "../identities/jose_token_generator";
import { TOKEN_HASHER_TOKEN } from "src/domain/ports/token_hasher";
import { BcryptTokenHasher } from "../securities/bcrypt_token_hasher";

@Module({
  providers: [
    {
      provide: PASSWORD_HASHER_TOKEN,
      useClass: BcryptPasswordHasher,
    },
    {
      provide: TOKEN_GENERATOR_TOKEN,
      useClass: JoseTokenGenerator,
    },
    {
      provide: TOKEN_HASHER_TOKEN,
      useClass: BcryptTokenHasher,
    },
  ],
  exports: [PASSWORD_HASHER_TOKEN, TOKEN_GENERATOR_TOKEN, TOKEN_HASHER_TOKEN],
})
export class SharedModule {}
