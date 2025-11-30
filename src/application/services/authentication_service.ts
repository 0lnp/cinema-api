import { type UserRepository } from "src/domain/repositories/user_repository";
import {
  type AuthenticateResult,
  type AuthenticateCommand,
} from "../types/authenticate";
import {
  type JoseTokenManager,
  type TokenGeneratePayload,
  TokenType,
} from "src/shared/utilities/jose_token_manager";
import {
  ApplicationError,
  ApplicationErrorType,
} from "src/errors/application_error";

export class AuthenticationService {
  public constructor(
    private userRepository: UserRepository,
    private jwtTokenManager: JoseTokenManager,
  ) {}

  public async authenticate(
    command: AuthenticateCommand,
  ): Promise<AuthenticateResult> {
    const user = await this.userRepository.userOfEmail(command.emailAddress);
    if (!user)
      throw new ApplicationError({
        type: ApplicationErrorType.EMAIL_NOT_FOUND_ERROR,
        message: `No user registered with email: ${command.emailAddress}`,
      });

    const isPasswordValid = await user.login(command.plainPassword);
    if (!isPasswordValid)
      throw new ApplicationError({
        type: ApplicationErrorType.PASSWORD_INVALID_ERROR,
        message: `Invalid password for user ${user.id.value}`,
      });

    const payload: TokenGeneratePayload = {
      sub: user.id,
      role: user.roleAssignment.role.name,
    };
    const accessToken = await this.jwtTokenManager.generate(
      payload,
      TokenType.ACCESS,
    );
    const refreshToken = await this.jwtTokenManager.generate(
      payload,
      TokenType.REFRESH,
    );

    return {
      accessToken,
      refreshToken,
    };
  }
}
