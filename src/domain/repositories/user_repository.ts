import { type User } from "../aggregates/user";
import { type ClassProps } from "src/shared/types/class_props";
import { type UserID } from "../value_objects/user_id";

export type FindOneProps = Partial<
  Pick<ClassProps<User>, "id" | "emailAddress">
>;

export abstract class UserRepository {
  abstract userOfEmail(emailAddress: string): Promise<User | null>;
  abstract existsByEmail(emailAddress: string): Promise<boolean>;
  abstract save(user: User): Promise<void>;
  abstract nextIdentity(): Promise<UserID>;
}
