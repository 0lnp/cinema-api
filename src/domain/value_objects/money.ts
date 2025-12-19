export enum CurrencyCode {
  IDR = "IDR",
}

export class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: CurrencyCode,
  ) {}

  public static create(amount: number, currency: CurrencyCode): Money {
    if (amount < 0) {
      throw new Error("Amount cannot be negative");
    }
    return new Money(amount, currency);
  }

  public static zero(currency: CurrencyCode): Money {
    return new Money(0, currency);
  }
}
