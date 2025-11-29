import { generateID } from "src/shared/utilities/generate_id";

export class UserID {
  public constructor(public readonly value: string) {}

  public static generate(): UserID {
    const id = generateID();
    return new UserID(`user_${id}`);
  }
}
