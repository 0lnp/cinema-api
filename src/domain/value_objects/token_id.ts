export class RefreshTokenID {
  public constructor(public readonly value: string) {
    if (!this.isValidID()) {
      throw new Error("Invalid refresh token ID format");
    }
  }

  private isValidID(): boolean {
    const idRegex = /^refresh_token_[a-zA-Z0-9_-]{8,}$/;
    return idRegex.test(this.value);
  }
}
