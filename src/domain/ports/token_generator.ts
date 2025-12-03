export interface JWTClaims {
  sub: string;
  role: string;
  iat: number;
  exp: number;
}
export type AccessTokenPayload = Omit<JWTClaims, "iat" | "exp">;
export type RefreshTokenPayload = Pick<JWTClaims, "sub">;
export type RefreshTokenClaims = Pick<JWTClaims, "sub" | "iat" | "exp">;

export interface TokenGenerator {
  generate<P extends AccessTokenPayload | RefreshTokenPayload>(
    payload: P,
    tokenType: "access" | "refresh",
  ): Promise<string>;
  verify<C extends JWTClaims | RefreshTokenClaims>(
    token: string,
    tokenType: "access" | "refresh",
  ): Promise<C>;
}

export const TOKEN_GENERATOR_TOKEN = Symbol.for("TokenGenerator");
