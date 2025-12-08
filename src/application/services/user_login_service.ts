import { UserRepository } from "src/domain/repositories/user_repository";
import {
  UserLoginDTO,
  UserLoginDTOSchema,
  UserLoginResult,
} from "../dtos/user_login_dto";
import { Inject } from "@nestjs/common";
import { validate } from "src/shared/utilities/validation";
import { Email } from "src/domain/value_objects/email";
import {
  ApplicationError,
  ApplicationErrorCode,
} from "src/shared/exceptions/application_error";
import { PasswordHasher } from "src/domain/ports/password_hasher";
import { TokenHasher } from "src/domain/ports/token_hasher";
import { TokenGenerator } from "src/domain/ports/token_generator";
import { RefreshToken, TokenStatus } from "src/domain/aggregates/refresh_token";
import { RefreshTokenRepository } from "src/domain/repositories/refresh_token_repository";

export class UserLoginService {
  public constructor(
    @Inject(UserRepository.name)
    private readonly userRepository: UserRepository,
    @Inject(PasswordHasher.name)
    private readonly passwordHasher: PasswordHasher,
    @Inject(TokenGenerator.name)
    private readonly tokenGenerator: TokenGenerator,
    @Inject(RefreshTokenRepository.name)
    private readonly refreshTokenRepository: RefreshTokenRepository,
    @Inject(TokenHasher.name)
    private readonly tokenHasher: TokenHasher,
  ) {}

  public async execute(request: UserLoginDTO): Promise<UserLoginResult> {
    const dto = validate(UserLoginDTOSchema, request);
    const email = Email.create(dto.email);

    const user = await this.userRepository.userOfEmail(email);
    if (user === null) {
      throw new ApplicationError({
        message: "Invalid email or password",
        code: ApplicationErrorCode.INVALID_CREDENTIALS,
      });
    }

    const passwordMatch = await this.passwordHasher.compare(
      request.password,
      user.passwordHash,
    );
    if (!passwordMatch) {
      throw new ApplicationError({
        message: "Invalid email or password",
        code: ApplicationErrorCode.INVALID_CREDENTIALS,
      });
    }

    const accessToken = await this.tokenGenerator.generate(
      { sub: user.id.value, role: user.roleName },
      "access",
    );
    const rawRefreshToken = await this.tokenGenerator.generate(
      { sub: user.id.value },
      "refresh",
    );

    const refreshTokenID = await this.refreshTokenRepository.nextIdentity();
    const refreshTokenFamily = await this.refreshTokenRepository.nextIdentity();
    const refreshTokenHash = await this.tokenHasher.hash(rawRefreshToken);
    const refreshTokenExpiresAt = new Date(
      Date.now() + TokenGenerator.REFRESH_TOKEN_LIFETIME_MS,
    );

    const refreshToken = RefreshToken.issue({
      id: refreshTokenID,
      userID: user.id,
      tokenHash: refreshTokenHash,
      tokenFamily: refreshTokenFamily,
      status: TokenStatus.ACTIVE,
      expiresAt: refreshTokenExpiresAt,
    });

    await this.refreshTokenRepository.save(refreshToken);

    return {
      accessToken,
      refreshToken: rawRefreshToken,
    };
  }
}
