export interface JWTClaims {
  sub: string;
  role: string;
  iat: number;
  exp: number;
}

export type PayloadForType<T extends "access" | "refresh"> = T extends "access"
  ? Omit<JWTClaims, "iat" | "exp">
  : Pick<JWTClaims, "sub">;
export type ClaimsForType<T extends "access" | "refresh"> = T extends "access"
  ? JWTClaims
  : Pick<JWTClaims, "sub" | "iat" | "exp">;

export abstract class TokenGenerator {
  public static readonly ACCESS_TOKEN_LIFETIME_MS = 15 * 60 * 1000; // 15 min
  public static readonly REFRESH_TOKEN_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

  public abstract generate<T extends "access" | "refresh">(
    payload: PayloadForType<T>,
    tokenType: T,
  ): Promise<string>;
  public abstract verify<T extends "access" | "refresh">(
    token: string,
    tokenType: T,
  ): Promise<ClaimsForType<T>>;
}
