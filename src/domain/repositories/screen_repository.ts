import { Screen } from "../aggregates/screen";
import { type ScreenID } from "../value_objects/screen_id";

export abstract class ScreenRepository {
  public abstract screenOfID(id: ScreenID): Promise<Screen | null>;
  public abstract nextIdentity(): Promise<ScreenID>;
  public abstract save(screen: Screen): Promise<void>;
}
