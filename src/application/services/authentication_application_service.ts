import { type AuthenticationService } from "src/domain/services/authentication_service";
import {
  LoginDTO,
  LoginDTOSchema,
  LoginResult,
  RegisterDTO,
  RegisterDTOSchema,
  RegisterResult,
} from "../dtos/authentication_dto";
import { EmailAddress } from "src/domain/value_objects/email_address";
import { UserRepository } from "src/domain/repositories/user_repository";
import {
  ApplicationError,
  ApplicationErrorCode,
} from "src/shared/exceptions/application_error";
import { RefreshTokenRepository } from "src/domain/repositories/refresh_token_repository";
import { validate } from "src/shared/utilities/validation";

export class AuthenticationApplicationService {
  public constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  public async register(request: RegisterDTO): Promise<RegisterResult> {
    const dto = validate(RegisterDTOSchema, request);

    const emailAddress = new EmailAddress(dto.email);
    const user = await this.authenticationService.register(
      dto.name,
      emailAddress,
      dto.password,
    );

    await this.userRepository.save(user);

    return { userID: user.id.value };
  }

  public async login(request: LoginDTO): Promise<LoginResult> {
    const dto = validate(LoginDTOSchema, request);

    const emailAddress = new EmailAddress(dto.email);
    const authenticateResult = await this.authenticationService.authenticate(
      emailAddress,
      dto.password,
    );
    if (authenticateResult === null) {
      throw new ApplicationError({
        code: ApplicationErrorCode.INVALID_CREDENTIALS,
        message: "Invalid email or password",
      });
    }

    await this.userRepository.save(authenticateResult.user);
    await this.refreshTokenRepository.save(authenticateResult.refreshToken);

    return {
      accessToken: authenticateResult.accessToken,
      refreshToken: authenticateResult.rawRefreshToken,
    };
  }
}

export const AUTHENTICATION_APPLICATION_SERVICE_TOKEN = Symbol.for(
  "AuthenticationApplicationService",
);
