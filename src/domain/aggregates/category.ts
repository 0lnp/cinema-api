import { type ClassProps } from "src/shared/types/class_props";
import { CategoryID } from "../value_objects/category_id";

type CategoryCreateRootProps = Omit<
  ClassProps<Category>,
  "parentId" | "path" | "level" | "createdAt"
>;

type CategoryCreateChildProps = Omit<
  ClassProps<Category>,
  "path" | "level" | "createdAt"
> & {
  parent: Category;
};

export class Category {
  public readonly id: CategoryID;
  public readonly name: string;
  public readonly parentId: CategoryID | null;
  public readonly path: string;
  public readonly level: number;
  public readonly createdAt: Date;

  public constructor(props: ClassProps<Category>) {
    this.id = props.id;
    this.name = props.name;
    this.parentId = props.parentId;
    this.path = props.path;
    this.level = props.level;
    this.createdAt = props.createdAt;
  }

  public static createRoot(props: CategoryCreateRootProps): Category {
    return new Category({
      id: props.id,
      name: props.name,
      parentId: null,
      path: props.id.value,
      level: 0,
      createdAt: new Date(),
    });
  }

  public static createChild(props: CategoryCreateChildProps): Category {
    return new Category({
      id: props.id,
      name: props.name,
      parentId: props.parent.id,
      path: `${props.parent.path}/${props.id.value}`,
      level: props.parent.level + 1,
      createdAt: new Date(),
    });
  }

  public isRoot(): boolean {
    return this.parentId === null;
  }

  public hasParent(): boolean {
    return this.parentId !== null;
  }

  public isDescendantOf(ancestorId: CategoryID): boolean {
    return this.path.includes(ancestorId.value);
  }
}
