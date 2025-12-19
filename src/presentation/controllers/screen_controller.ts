import {
  Body,
  Controller,
  Delete,
  Inject,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { ScreenApplicationService } from "src/application/services/screen_application_service";
import {
  DeleteScreenParamsDTO,
  PatchScreenIDBodyDTO,
  PatchScreenIDParamsDTO,
  PostScreensBodyDTO,
} from "../dtos/screen_dto";
import { ScreenMapper } from "../mappers/screen_mapper";
import { AuthGuard } from "../guards/auth_guard";
import { Permissions } from "../decorators/permissions";
import {
  PermissionAction,
  PermissionResource,
} from "src/domain/value_objects/permission";
import { type Request as TRequest } from "express";
import { PermissionsGuard } from "../guards/permissions_guard";

@Controller("screens")
export class ScreenController {
  public constructor(
    @Inject(ScreenApplicationService.name)
    private readonly screenService: ScreenApplicationService,
  ) {}

  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(
    [PermissionAction.CREATE, PermissionResource.SCREEN],
    [PermissionAction.MANAGE, PermissionResource.SCREEN],
  )
  @Post()
  async postScreens(
    @Request() req: TRequest,
    @Body() body: PostScreensBodyDTO,
  ) {
    const dto = ScreenMapper.toCreateRequest(body);
    const result = await this.screenService.create({
      ...dto,
      createdBy: req.user.id,
    });
    return ScreenMapper.toCreateResponse(result);
  }

  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions([PermissionAction.MANAGE, PermissionResource.SCREEN])
  @Patch(":screen_id")
  async patchScreenID(
    @Param() params: PatchScreenIDParamsDTO,
    @Body() body: PatchScreenIDBodyDTO,
  ) {
    const dto = ScreenMapper.toSetLayoutRequest(params, body);
    const result = await this.screenService.setLayout(dto);
    return ScreenMapper.toSetLayoutResponse(result);
  }

  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions([PermissionAction.MANAGE, PermissionResource.SCREEN])
  @Delete(":screen_id")
  async deleteScreenID(
    @Request() req: TRequest,
    @Param() params: DeleteScreenParamsDTO,
  ) {
    const result = await this.screenService.deleteScreen({
      screenID: params.screen_id,
      deletedBy: req.user.id,
    });
    return ScreenMapper.toDeleteResponse(result);
  }
}
