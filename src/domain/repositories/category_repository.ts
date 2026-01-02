import { Category } from "../aggregates/category";
import { CategoryID } from "../value_objects/category_id";

export abstract class CategoryRepository {
  public abstract categoryOfID(id: CategoryID): Promise<Category | null>;
  public abstract rootCategories(): Promise<Category[]>;
  public abstract childrenOf(parentId: CategoryID): Promise<Category[]>;
  public abstract allCategories(): Promise<Category[]>;
  public abstract nextIdentity(): Promise<CategoryID>;
  public abstract save(category: Category): Promise<void>;
}
