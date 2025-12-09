import { validate } from "src/shared/utilities/validation";
import {
  RefreshTokenDTO,
  RefreshTokenDTOSchema,
  RefreshTokenResult,
} from "../dtos/refresh_token_dto";
import {
  TokenManagementService,
  TokenRotationFailureReason,
} from "src/domain/services/token_management_service";
import { Inject } from "@nestjs/common";
import { RefreshTokenRepository } from "src/domain/repositories/refresh_token_repository";
import { TokenGenerator } from "src/domain/ports/token_generator";
import {
  ApplicationError,
  ApplicationErrorCode,
} from "src/shared/exceptions/application_error";

export class RefreshTokenApplicationService {
  public constructor(
    @Inject(TokenGenerator.name)
    private readonly tokenGenerator: TokenGenerator,
    @Inject(TokenManagementService.name)
    private readonly tokenManagementService: TokenManagementService,
    @Inject(RefreshTokenRepository.name)
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  public async execute(request: RefreshTokenDTO): Promise<RefreshTokenResult> {
    const dto = validate(RefreshTokenDTOSchema, request);

    await this.tokenGenerator.verify(dto.refreshToken, "refresh");

    const result = await this.tokenManagementService.rotateToken(
      dto.refreshToken,
    );

    if (!result.success) {
      switch (result.failureReason) {
        case TokenRotationFailureReason.TOKEN_REUSE_DETECTED:
          await this.refreshTokenRepository.revokeByFamily(result.tokenFamily);
          throw new ApplicationError({
            code: ApplicationErrorCode.TOKEN_REUSE_DETECTED,
            message: "Invalid refresh token",
          });
        case TokenRotationFailureReason.TOKEN_NOT_FOUND:
          throw new ApplicationError({
            code: ApplicationErrorCode.INVALID_REFRESH_TOKEN,
            message: "Invalid refresh token",
          });
        default:
          throw new Error(`Unknown token rotation error`);
      }
    }

    await this.refreshTokenRepository.save(result.oldRefreshToken);
    await this.refreshTokenRepository.save(result.newRefreshToken);

    return {
      message: "Token refreshed successfully",
      accessToken: result.newAccessToken,
      refreshToken: result.newRawRefreshToken,
    };
  }
}
