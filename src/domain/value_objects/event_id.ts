import { randomBytes } from "crypto";

export class EventID {
  public constructor(public readonly value: string) {}

  public static generate(): EventID {
    const randomness = randomBytes(8).toString("hex");
    return new EventID(`EVT_${randomness}`);
  }

  public equals(other: EventID): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}
