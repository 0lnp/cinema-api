import { Inject } from "@nestjs/common";
import { RefreshToken, TokenStatus } from "../aggregates/refresh_token";
import { RefreshTokenRepository } from "../repositories/refresh_token_repository";
import { TokenHasher } from "../ports/token_hasher";
import { TokenGenerator } from "../ports/token_generator";
import { UserRepository } from "../repositories/user_repository";
import { TokenID } from "../value_objects/token_id";

type TokenRotationSuccess = {
  success: true;
  oldRefreshToken: RefreshToken;
  newAccessToken: string;
  newRawRefreshToken: string;
  newRefreshToken: RefreshToken;
};

type TokenRotationFailure =
  | {
      success: false;
      failureReason: TokenRotationFailureReason.TOKEN_NOT_FOUND;
    }
  | {
      success: false;
      failureReason: TokenRotationFailureReason.TOKEN_REUSE_DETECTED;
      tokenFamily: TokenID;
    };

type TokenRotationResult = TokenRotationSuccess | TokenRotationFailure;

export enum TokenRotationFailureReason {
  TOKEN_NOT_FOUND = "TOKEN_NOT_FOUND",
  TOKEN_REUSE_DETECTED = "TOKEN_REUSE_DETECTED",
}

export class TokenManagementService {
  public constructor(
    @Inject(TokenGenerator.name)
    private readonly tokenGenerator: TokenGenerator,
    @Inject(TokenHasher.name)
    private readonly tokenHasher: TokenHasher,
    @Inject(RefreshTokenRepository.name)
    private readonly refreshTokenRepository: RefreshTokenRepository,
    @Inject(UserRepository.name)
    private readonly userRepository: UserRepository,
  ) {}

  public async rotateToken(
    rawRefreshToken: string,
  ): Promise<TokenRotationResult> {
    const tokenHash = await this.tokenHasher.hash(rawRefreshToken);
    const token = await this.refreshTokenRepository.tokenOfHash(tokenHash);
    if (token === null) {
      return {
        success: false,
        failureReason: TokenRotationFailureReason.TOKEN_NOT_FOUND,
      };
    }

    if (token.status === TokenStatus.ROTATED) {
      return {
        success: false,
        failureReason: TokenRotationFailureReason.TOKEN_REUSE_DETECTED,
        tokenFamily: token.tokenFamily,
      };
    }

    token.rotate();

    const user = await this.userRepository.userOfID(token.userID);
    if (user === null) {
      return {
        success: false,
        failureReason: TokenRotationFailureReason.TOKEN_NOT_FOUND,
      };
    }

    const newAccessToken = await this.tokenGenerator.generate(
      { sub: user.id.value, role: user.roleName },
      "access",
    );
    const newRawRefreshToken = await this.tokenGenerator.generate(
      { sub: user.id.value },
      "refresh",
    );

    const newTokenID = await this.refreshTokenRepository.nextIdentity();
    const newTokenHash = await this.tokenHasher.hash(newRawRefreshToken);
    const newTokenExpiresAt = new Date(
      Date.now() + TokenGenerator.REFRESH_TOKEN_LIFETIME_MS,
    );
    const newRefreshToken = RefreshToken.issue({
      id: newTokenID,
      userID: token.userID,
      tokenHash: newTokenHash,
      tokenFamily: token.tokenFamily,
      status: TokenStatus.ACTIVE,
      expiresAt: newTokenExpiresAt,
    });

    return {
      success: true,
      oldRefreshToken: token,
      newAccessToken,
      newRawRefreshToken,
      newRefreshToken,
    };
  }
}
