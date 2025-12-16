import { validate } from "src/shared/utilities/validation";
import {
  UserLogoutDTO,
  UserLogoutDTOSchema,
  UserLogoutResult,
} from "../dtos/user_logout_dto";
import { TokenBlacklistManager } from "src/domain/ports/token_blacklist_manager";
import { Inject } from "@nestjs/common";
import { TokenHasher } from "src/domain/ports/token_hasher";
import { JWTClaims } from "src/domain/ports/token_generator";

export class UserLogoutApplicationService {
  public constructor(
    @Inject(TokenHasher.name)
    private readonly tokenHasher: TokenHasher,
    @Inject(TokenBlacklistManager.name)
    private readonly tokenBlacklistManager: TokenBlacklistManager,
  ) {}

  public async execute(request: UserLogoutDTO): Promise<UserLogoutResult> {
    const dto = validate(UserLogoutDTOSchema, request);

    const payloadBuf = Buffer.from(dto.accessToken.split(".")[1]!, "base64");
    const payload: JWTClaims = JSON.parse(payloadBuf.toString());

    const expiresAt = new Date(payload.exp * 1000);
    const tokenHash = await this.tokenHasher.hash(dto.accessToken);
    await this.tokenBlacklistManager.blacklist(
      tokenHash,
      dto.userID,
      expiresAt,
    );

    return {
      message: "User logged out successfully",
    };
  }
}
