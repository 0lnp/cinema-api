import { type BaseSuccessfulResponse } from "src/shared/types/base_successful_response";
import {
  CategoryListItem,
  CreateCategoryResult,
  DeleteCategoryResult,
  GetAllCategoriesResult,
  GetCategoryTreeResult,
  CreateRootCategoryDTO,
  CreateChildCategoryDTO,
} from "src/application/dtos/category_dto";
import {
  CategoryIdParamsDTO,
  PostCategoryBodyDTO,
} from "../dtos/category_dto";

export interface CategoryItemResponse {
  id: string;
  name: string;
  parent_id: string | null;
  path: string;
  level: number;
  created_at: string;
}

export interface GetAllCategoriesDataResponse {
  items: CategoryItemResponse[];
}

export interface CategoryTreeNodeResponse {
  id: string;
  name: string;
  level: number;
  children: CategoryTreeNodeResponse[];
}

export interface GetCategoryTreeDataResponse {
  tree: CategoryTreeNodeResponse[];
}

export interface DeleteCategoryResponse {
  id: string;
}

export class CategoryMapper {
  public static toCreateRootRequest(
    body: PostCategoryBodyDTO,
  ): CreateRootCategoryDTO {
    return {
      name: body.name,
    };
  }

  public static toCreateChildRequest(
    params: CategoryIdParamsDTO,
    body: PostCategoryBodyDTO,
  ): CreateChildCategoryDTO {
    return {
      name: body.name,
      parentId: params.id,
    };
  }

  public static toCreateResponse(
    result: CreateCategoryResult,
  ): BaseSuccessfulResponse<CategoryItemResponse> {
    return {
      message: result.message,
      data: {
        id: result.id,
        name: result.name,
        parent_id: result.parentId,
        path: result.path,
        level: result.level,
        created_at: result.createdAt.toISOString(),
      },
    };
  }

  public static toGetAllResponse(
    result: GetAllCategoriesResult,
  ): BaseSuccessfulResponse<GetAllCategoriesDataResponse> {
    return {
      message: result.message,
      data: {
        items: result.items.map((item) => this.toCategoryItemResponse(item)),
      },
    };
  }

  public static toCategoryItemResponse(item: CategoryListItem): CategoryItemResponse {
    return {
      id: item.id,
      name: item.name,
      parent_id: item.parentId,
      path: item.path,
      level: item.level,
      created_at: item.createdAt.toISOString(),
    };
  }

  public static toGetTreeResponse(
    result: GetCategoryTreeResult,
  ): BaseSuccessfulResponse<GetCategoryTreeDataResponse> {
    return {
      message: result.message,
      data: {
        tree: result.tree,
      },
    };
  }

  public static toDeleteRequest(params: CategoryIdParamsDTO) {
    return {
      categoryId: params.id,
    };
  }

  public static toDeleteResponse(
    result: DeleteCategoryResult,
  ): BaseSuccessfulResponse<DeleteCategoryResponse> {
    return {
      message: result.message,
      data: { id: result.id },
    };
  }
}
