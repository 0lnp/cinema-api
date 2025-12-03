import { ConfigService } from "@nestjs/config";
import {
  AccessTokenPayload,
  JWTClaims,
  RefreshTokenClaims,
  RefreshTokenPayload,
  TokenGenerator,
} from "src/domain/ports/token_generator";
import { AppConfig } from "../configs/app_config";
import { jwtVerify, SignJWT } from "jose";
import { Inject } from "@nestjs/common";
import { RefreshToken } from "src/domain/aggregates/refresh_token";

export class JoseTokenGenerator implements TokenGenerator {
  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  public async generate<P extends AccessTokenPayload | RefreshTokenPayload>(
    payload: P,
    tokenType: "access" | "refresh",
  ): Promise<string> {
    const secretStr = this.configService.get(
      tokenType === "access" ? "JWT_ACCESS_SECRET" : "JWT_REFRESH_SECRET",
      { infer: true },
    );
    const secret = new TextEncoder().encode(secretStr);
    const accessLifetime = this.configService.get("JWT_ACCESS_LIFETIME", {
      infer: true,
    });
    const refreshLifetimeDays = Math.ceil(
      RefreshToken.REFRESH_TOKEN_LIFETIME_MS / (1000 / 60 / 60 / 24),
    );
    const { sub, ...remaing } = payload;
    const lifetime =
      tokenType === "access" ? accessLifetime : refreshLifetimeDays;

    const accessToken = new SignJWT(remaing)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(lifetime)
      .setSubject(sub)
      .sign(secret);

    return accessToken;
  }

  public async verify<C extends JWTClaims | RefreshTokenClaims>(
    token: string,
    tokenType: "access" | "refresh",
  ): Promise<C> {
    const secretStr = this.configService.get(
      tokenType === "access" ? "JWT_ACCESS_SECRET" : "JWT_REFRESH_SECRET",
      { infer: true },
    );
    const secret = new TextEncoder().encode(secretStr);

    const { payload } = await jwtVerify<C>(token, secret);
    return payload;
  }
}
