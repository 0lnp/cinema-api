import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { CategoryApplicationService } from "src/application/services/category_application_service";
import { AuthGuard } from "../guards/auth_guard";
import { PermissionsGuard } from "../guards/permissions_guard";
import { Permissions } from "../decorators/permissions";
import {
  PermissionAction,
  PermissionResource,
} from "src/domain/value_objects/permission";
import { ZodValidationPipe } from "../pipes/zod_validation_pipe";
import {
  CategoryIdParamsDTO,
  CategoryIdParamsDTOSchema,
  PostCategoryBodyDTO,
  PostCategoryBodyDTOSchema,
} from "../dtos/category_dto";
import { CategoryMapper } from "../mappers/category_mapper";

@Controller("categories")
export class CategoryController {
  public constructor(
    private readonly categoryService: CategoryApplicationService,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  public async getAllCategories() {
    const result = await this.categoryService.getAllCategories();
    return CategoryMapper.toGetAllResponse(result);
  }

  @UseGuards(AuthGuard)
  @Get("tree")
  public async getCategoryTree() {
    const result = await this.categoryService.getCategoryTree();
    return CategoryMapper.toGetTreeResponse(result);
  }

  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions([PermissionAction.MANAGE, PermissionResource.MOVIE])
  @Post()
  public async createRootCategory(
    @Body(new ZodValidationPipe(PostCategoryBodyDTOSchema))
    body: PostCategoryBodyDTO,
  ) {
    const dto = CategoryMapper.toCreateRootRequest(body);
    const result = await this.categoryService.createRootCategory(dto);
    return CategoryMapper.toCreateResponse(result);
  }

  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions([PermissionAction.MANAGE, PermissionResource.MOVIE])
  @Post(":id/children")
  public async createChildCategory(
    @Param(new ZodValidationPipe(CategoryIdParamsDTOSchema))
    params: CategoryIdParamsDTO,
    @Body(new ZodValidationPipe(PostCategoryBodyDTOSchema))
    body: PostCategoryBodyDTO,
  ) {
    const dto = CategoryMapper.toCreateChildRequest(params, body);
    const result = await this.categoryService.createChildCategory(dto);
    return CategoryMapper.toCreateResponse(result);
  }

  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions([PermissionAction.MANAGE, PermissionResource.MOVIE])
  @Delete(":id")
  public async deleteCategory(
    @Param(new ZodValidationPipe(CategoryIdParamsDTOSchema))
    params: CategoryIdParamsDTO,
  ) {
    const dto = CategoryMapper.toDeleteRequest(params);
    const result = await this.categoryService.deleteCategory(dto);
    return CategoryMapper.toDeleteResponse(result);
  }
}
