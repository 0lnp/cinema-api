export class UserID {
  public constructor(public readonly value: string) {
    if (!this.isValidID()) {
      throw new Error("Invalid user ID format");
    }
  }

  private isValidID(): boolean {
    const idRegex = /^user_[a-zA-Z0-9_-]{8,}$/;
    return idRegex.test(this.value);
  }
}
