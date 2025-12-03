export interface PasswordHasher {
  hash(plainPassword: string): Promise<string>;
  compare(plainPassword: string, hashedPassword: string): Promise<boolean>;
}

export const PASSWORD_HASHER_TOKEN = Symbol.for("PasswordHasher");
