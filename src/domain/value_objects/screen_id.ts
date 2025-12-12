import { randomUUID } from "node:crypto";

export class ScreenID {
  public constructor(public readonly value: string) {}

  public static generate(): ScreenID {
    const id = `SCR_${randomUUID()}`;
    return new ScreenID(id);
  }
}
