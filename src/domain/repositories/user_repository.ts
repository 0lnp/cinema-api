import { type User } from "../aggregates/user";
import { type Email } from "../value_objects/email";
import { type UserID } from "../value_objects/user_id";

export abstract class UserRepository {
  public abstract userOfID(id: UserID): Promise<User | null>;
  public abstract userOfEmail(email: Email): Promise<User | null>;
  public abstract existsByEmail(email: Email): Promise<boolean>;
  public abstract save(user: User): Promise<void>;
  public abstract nextIdentity(): Promise<UserID>;
}
