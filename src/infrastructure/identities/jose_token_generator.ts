import { ConfigService } from "@nestjs/config";
import {
  type ClaimsForType,
  type PayloadForType,
  type TokenGenerator,
} from "src/domain/ports/token_generator";
import { type AppConfig } from "../configs/app_config";
import { jwtVerify, SignJWT, errors } from "jose";
import { Inject } from "@nestjs/common";
import {
  InfrastructureError,
  InfrastructureErrorCode,
} from "src/shared/exceptions/infrastructure_error";
import {
  ApplicationError,
  ApplicationErrorCode,
} from "src/shared/exceptions/application_error";
import { capitalize } from "src/shared/utilities/capitalize";

export class JoseTokenGenerator implements TokenGenerator {
  public constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  public async generate<T extends "access" | "refresh">(
    payload: PayloadForType<T>,
    tokenType: T,
  ): Promise<string> {
    const secretStr = this.configService.get(
      tokenType === "access"
        ? "JWT_ACCESS_TOKEN_SECRET"
        : "JWT_REFRESH_TOKEN_SECRET",
      { infer: true },
    );
    const secret = new TextEncoder().encode(secretStr);
    const lifetime = this.configService.get(
      tokenType === "access"
        ? "JWT_ACCESS_TOKEN_LIFETIME"
        : "JWT_REFRESH_TOKEN_LIFETIME",
      { infer: true },
    );
    const { sub, ...remaing } = payload;

    const accessToken = new SignJWT(remaing)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(lifetime)
      .setSubject(sub)
      .sign(secret);

    return accessToken;
  }

  public async verify<T extends "access" | "refresh">(
    token: string,
    tokenType: T,
  ): Promise<ClaimsForType<T>> {
    const secretStr = this.configService.get(
      tokenType === "access"
        ? "JWT_ACCESS_TOKEN_SECRET"
        : "JWT_REFRESH_TOKEN_SECRET",
      { infer: true },
    );
    const secret = new TextEncoder().encode(secretStr);

    try {
      const { payload } = await jwtVerify<ClaimsForType<T>>(token, secret);
      return payload;
    } catch (error) {
      if (
        error instanceof errors.JWSInvalid ||
        error instanceof errors.JWSSignatureVerificationFailed
      ) {
        throw new ApplicationError({
          code: ApplicationErrorCode.INVALID_JWT_TOKEN,
          message: `Invalid ${tokenType} token`,
        });
      } else if (error instanceof errors.JWTExpired) {
        throw new ApplicationError({
          code: ApplicationErrorCode.EXPIRED_JWT_TOKEN,
          message: `${capitalize(tokenType)} token has expired`,
        });
      } else {
        throw new InfrastructureError({
          code: InfrastructureErrorCode.JWT_VERIFICATION_FAILED,
          message:
            error instanceof Error
              ? error.message
              : "Unknown JWT verification error",
          stack: error instanceof Error ? error.stack : undefined,
        });
      }
    }
  }
}
