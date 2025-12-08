export abstract class TokenHasher {
  public abstract hash(token: string): Promise<string>;
}
