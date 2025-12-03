import { type AuthenticationService } from "src/domain/services/authentication_service";
import {
  LoginDTO,
  LoginResult,
  RegisterDTO,
  RegisterResult,
} from "../dtos/authentication_dto";
import { EmailAddress } from "src/domain/value_objects/email_address";
import { UserRepository } from "src/domain/repositories/user_repository";
import {
  ApplicationError,
  ApplicationErrorCode,
} from "src/shared/exceptions/application_error";
import { RefreshTokenRepository } from "src/domain/repositories/refresh_token_repository";

export class AuthenticationApplicationService {
  public constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  public async register(dto: RegisterDTO): Promise<RegisterResult> {
    const dtoErrors = this.validateRegisterDTO(dto);
    if (dtoErrors !== null) {
      throw new ApplicationError({
        code: ApplicationErrorCode.ILLEGAL_ARGUMENT,
        message: "Missing required fields",
        details: dtoErrors,
      });
    }

    const emailAddress = new EmailAddress(dto.email);
    const user = await this.authenticationService.register(
      dto.name,
      emailAddress,
      dto.password,
    );

    await this.userRepository.save(user);

    return { userID: user.id.value };
  }

  private validateRegisterDTO(dto: RegisterDTO): Record<string, string> | null {
    const errors: Record<string, string> = {};

    if (!dto.name) {
      errors.name = "Name is required";
    }
    if (!dto.email) {
      errors.email = "Email is required";
    }
    if (!dto.password) {
      errors.password = "Password is required";
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  public async login(dto: LoginDTO): Promise<LoginResult> {
    const dtoErrors = this.validateLoginDTO(dto);
    if (dtoErrors !== null) {
      throw new ApplicationError({
        code: ApplicationErrorCode.ILLEGAL_ARGUMENT,
        message: "Missing required fields",
        details: dtoErrors,
      });
    }

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

  private validateLoginDTO(dto: LoginDTO): Record<string, string> | null {
    const errors: Record<string, string> = {};

    if (!dto.email) {
      errors.email = "Email is required";
    }
    if (!dto.password) {
      errors.password = "Password is required";
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }
}

export const AUTHENTICATION_APPLICATION_SERVICE_TOKEN = Symbol.for(
  "AuthenticationApplicationService",
);
