import { SignJWT, jwtVerify } from "jose";
import { type JWTClaims } from "../types/jwt_claims";

export type TokenGeneratePayload = Omit<JWTClaims, "exp" | "iat">;
export enum TokenType {
  ACCESS = "access",
  REFRESH = "refresh",
}

export class JoseTokenManager {
  private readonly ALGORITHM = "HS256";

  public constructor(
    private readonly JWT_EXPIRATION_TIME: string,
    private readonly ACCESS_TOKEN_SECRET: string,
    private readonly REFRESH_TOKEN_SECRET: string,
  ) {
    if (!JWT_EXPIRATION_TIME)
      throw new Error("JWT expiration time is required");
    if (!ACCESS_TOKEN_SECRET) throw new Error("JWT secret is required");
    if (!REFRESH_TOKEN_SECRET) throw new Error("JWT secret is required");
  }

  public async generate(
    payload: TokenGeneratePayload,
    type: TokenType,
  ): Promise<string> {
    const { sub, ...remaing } = payload;
    const secret = new TextEncoder().encode(
      type === TokenType.ACCESS
        ? this.ACCESS_TOKEN_SECRET
        : this.REFRESH_TOKEN_SECRET,
    );
    const accessToken = await new SignJWT(remaing)
      .setSubject(sub.value)
      .setProtectedHeader({ alg: this.ALGORITHM })
      .setIssuedAt()
      .setExpirationTime(this.JWT_EXPIRATION_TIME)
      .sign(secret);
    return accessToken;
  }

  public async verify(token: string, type: TokenType): Promise<JWTClaims> {
    const secret = new TextEncoder().encode(
      type === TokenType.ACCESS
        ? this.ACCESS_TOKEN_SECRET
        : this.REFRESH_TOKEN_SECRET,
    );
    const result = await jwtVerify(token, secret);
    return result.payload as unknown as JWTClaims;
  }
}
