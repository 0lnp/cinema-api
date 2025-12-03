export interface TokenHasher {
  hash(token: string): Promise<string>;
}

export const TOKEN_HASHER_TOKEN = Symbol.for("TokenHasher");
