import { Inject } from "@nestjs/common";
import { CategoryRepository } from "src/domain/repositories/category_repository";
import { Category } from "src/domain/aggregates/category";
import {
  ApplicationError,
  ApplicationErrorCode,
} from "src/shared/exceptions/application_error";
import {
  CategoryListItem,
  CategoryTreeNode,
  CreateCategoryResult,
  CreateChildCategoryDTO,
  CreateRootCategoryDTO,
  DeleteCategoryDTO,
  DeleteCategoryResult,
  GetAllCategoriesResult,
  GetCategoryTreeResult,
} from "../dtos/category_dto";

export class CategoryApplicationService {
  public constructor(
    @Inject(CategoryRepository.name)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  public async getAllCategories(): Promise<GetAllCategoriesResult> {
    const categories = await this.categoryRepository.allCategories();

    return {
      message: "Categories retrieved successfully",
      items: categories.map((cat) => this.mapToListItem(cat)),
    };
  }

  public async getCategoryTree(): Promise<GetCategoryTreeResult> {
    const allCategories = await this.categoryRepository.allCategories();
    const tree = this.buildTree(allCategories);

    return {
      message: "Category tree retrieved successfully",
      tree,
    };
  }

  public async createRootCategory(
    dto: CreateRootCategoryDTO,
  ): Promise<CreateCategoryResult> {
    const categoryId = await this.categoryRepository.nextIdentity();
    const category = Category.createRoot({ id: categoryId, name: dto.name });

    await this.categoryRepository.save(category);

    return {
      message: "Root category created successfully",
      id: category.id.value,
      name: category.name,
      parentId: null,
      path: category.path,
      level: category.level,
      createdAt: category.createdAt,
    };
  }

  public async createChildCategory(
    dto: CreateChildCategoryDTO,
  ): Promise<CreateCategoryResult> {
    const parent = await this.categoryRepository.categoryOfID(dto.parentId);
    if (parent === null) {
      throw new ApplicationError({
        code: ApplicationErrorCode.RESOURCE_NOT_FOUND,
        message: `Parent category with ID "${dto.parentId.value}" not found`,
      });
    }

    const categoryId = await this.categoryRepository.nextIdentity();
    const category = Category.createChild({
      id: categoryId,
      name: dto.name,
      parentId: parent.id,
      parent: parent,
    });

    await this.categoryRepository.save(category);

    return {
      message: "Child category created successfully",
      id: category.id.value,
      name: category.name,
      parentId: parent.id.value,
      path: category.path,
      level: category.level,
      createdAt: category.createdAt,
    };
  }

  public async deleteCategory(
    dto: DeleteCategoryDTO,
  ): Promise<DeleteCategoryResult> {
    const category = await this.categoryRepository.categoryOfID(dto.categoryId);
    if (category === null) {
      throw new ApplicationError({
        code: ApplicationErrorCode.RESOURCE_NOT_FOUND,
        message: `Category with ID "${dto.categoryId.value}" not found`,
      });
    }

    const children = await this.categoryRepository.childrenOf(category.id);
    if (children.length > 0) {
      throw new ApplicationError({
        code: ApplicationErrorCode.INVALID_INPUT,
        message: "Cannot delete category with children",
      });
    }

    throw new ApplicationError({
      code: ApplicationErrorCode.INVALID_INPUT,
      message: "Category deletion not implemented",
    });
  }

  private mapToListItem(category: Category): CategoryListItem {
    return {
      id: category.id.value,
      name: category.name,
      parentId: category.parentId?.value ?? null,
      path: category.path,
      level: category.level,
      createdAt: category.createdAt,
    };
  }

  private buildTree(categories: Category[]): CategoryTreeNode[] {
    const rootCategories = categories.filter((c) => c.isRoot());

    return rootCategories.map((root) => this.buildNode(root, categories));
  }

  private buildNode(
    category: Category,
    allCategories: Category[],
  ): CategoryTreeNode {
    const children = allCategories.filter(
      (c) => c.parentId?.value === category.id.value,
    );

    return {
      id: category.id.value,
      name: category.name,
      level: category.level,
      children: children.map((child) => this.buildNode(child, allCategories)),
    };
  }
}
