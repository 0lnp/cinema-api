import { type User } from "../aggregates/user";
import { type EmailAddress } from "../value_objects/email_address";
import { type UserID } from "../value_objects/user_id";

export interface UserRepository {
  userOfEmail(emailAddress: EmailAddress): Promise<User | null>;
  existsByEmail(emailAddress: EmailAddress): Promise<boolean>;
  save(user: User): Promise<void>;
  nextIdentity(): Promise<UserID>;
}

export const USER_REPOSITORY_TOKEN = Symbol.for("UserRepository");
