export abstract class PasswordHasher {
  public abstract hash(plainPassword: string): Promise<string>;
  public abstract compare(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
}
