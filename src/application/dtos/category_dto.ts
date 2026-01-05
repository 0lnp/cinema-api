import { CategoryID } from "src/domain/value_objects/category_id";

export interface CreateRootCategoryDTO {
  name: string;
}

export interface CreateChildCategoryDTO {
  name: string;
  parentId: CategoryID;
}

export interface CreateCategoryResult {
  message: string;
  id: string;
  name: string;
  parentId: string | null;
  path: string;
  level: number;
  createdAt: Date;
}

export interface CategoryListItem {
  id: string;
  name: string;
  parentId: string | null;
  path: string;
  level: number;
  createdAt: Date;
}

export interface GetAllCategoriesResult {
  message: string;
  items: CategoryListItem[];
}

export interface CategoryTreeNode {
  id: string;
  name: string;
  level: number;
  children: CategoryTreeNode[];
}

export interface GetCategoryTreeResult {
  message: string;
  tree: CategoryTreeNode[];
}

export interface DeleteCategoryDTO {
  categoryId: CategoryID;
}

export interface DeleteCategoryResult {
  message: string;
  id: string;
}
