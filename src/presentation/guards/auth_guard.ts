import {
  CanActivate,
  ExecutionContext,
  Inject,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import { TokenBlacklistManager } from "src/domain/ports/token_blacklist_manager";
import { JWTClaims, TokenGenerator } from "src/domain/ports/token_generator";
import { TokenHasher } from "src/domain/ports/token_hasher";
import { UserRepository } from "src/domain/repositories/user_repository";
import { UserID } from "src/domain/value_objects/user_id";
import { ApplicationError } from "src/shared/exceptions/application_error";

export class AuthGuard implements CanActivate {
  constructor(
    @Inject(TokenGenerator.name)
    private readonly tokenGenerator: TokenGenerator,
    @Inject(UserRepository.name)
    private readonly userRepository: UserRepository,
    @Inject(TokenHasher.name)
    private readonly tokenHasher: TokenHasher,
    @Inject(TokenBlacklistManager.name)
    private readonly tokenBlacklistManager: TokenBlacklistManager,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException("No access token provided");
    }

    let payload: JWTClaims;
    try {
      payload = await this.tokenGenerator.verify(token, "access");
    } catch (error) {
      if (error instanceof ApplicationError) {
        throw new UnauthorizedException(error.message);
      }

      throw error;
    }

    const userID = new UserID(payload.sub);
    const user = await this.userRepository.userOfID(userID);
    if (user === null) {
      throw new Error("User not found");
    }

    const hash = await this.tokenHasher.hash(token);
    const blacklisted = await this.tokenBlacklistManager.isBlacklisted(hash);
    if (blacklisted) {
      throw new UnauthorizedException(
        "Token has been revoked. Please login again",
      );
    }

    request.user = user;
    request.accessToken = token;

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
