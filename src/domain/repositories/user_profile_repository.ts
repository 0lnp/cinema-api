import { UserProfile } from "../entities/user_profile";
import { UserID } from "../value_objects/user_id";

export abstract class UserProfileRepository {
  public abstract profileOfUser(userId: UserID): Promise<UserProfile | null>;
  public abstract save(profile: UserProfile): Promise<void>;
}
