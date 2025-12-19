import { randomUUID } from "node:crypto";

export class MovieID {
  public constructor(public readonly value: string) {}

  public static generate(): MovieID {
    const id = `MOV_${randomUUID()}`;
    return new MovieID(id);
  }

  public equals(other: MovieID): boolean {
    return this.value === other.value;
  }
}
