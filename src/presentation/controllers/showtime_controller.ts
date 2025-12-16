import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";
import { ShowtimeApplicationService } from "src/application/services/showtime_application_service";
import { AuthGuard } from "../guards/auth_guard";
import { PermissionsGuard } from "../guards/permissions_guard";
import { Permissions } from "../decorators/permissions";
import {
  PermissionAction,
  PermissionResource,
} from "src/domain/value_objects/permission";
import { type Request as TRequest } from "express";
import {
  DeleteShowtimeParamsDTO,
  GetShowtimeParamsDTO,
  GetShowtimesQueryDTO,
  PatchShowtimeBodyDTO,
  PatchShowtimeParamsDTO,
  PostShowtimeBodyDTO,
} from "../dtos/showtime_dto";
import { ShowtimeMapper } from "../mappers/showtime_mapper";

@Controller("showtimes")
export class ShowtimeController {
  public constructor(
    @Inject(ShowtimeApplicationService.name)
    private readonly showtimeService: ShowtimeApplicationService,
  ) {}

  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(
    [PermissionAction.VIEW, PermissionResource.SHOWTIME],
    [PermissionAction.VIEW_ALL, PermissionResource.SHOWTIME],
    [PermissionAction.MANAGE, PermissionResource.SHOWTIME],
  )
  @Get()
  async getShowtimes(@Query() query: GetShowtimesQueryDTO) {
    const dto = ShowtimeMapper.toGetAllRequest(query);
    const result = await this.showtimeService.getAllShowtimes(dto);
    return ShowtimeMapper.toGetAllResponse(result);
  }

  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(
    [PermissionAction.VIEW, PermissionResource.SHOWTIME],
    [PermissionAction.VIEW_ALL, PermissionResource.SHOWTIME],
    [PermissionAction.MANAGE, PermissionResource.SHOWTIME],
  )
  @Get(":showtime_id")
  async getShowtime(@Param() params: GetShowtimeParamsDTO) {
    const dto = ShowtimeMapper.toGetRequest(params);
    const result = await this.showtimeService.getShowtime(dto);
    return ShowtimeMapper.toGetResponse(result);
  }

  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(
    [PermissionAction.CREATE, PermissionResource.SHOWTIME],
    [PermissionAction.MANAGE, PermissionResource.SHOWTIME],
  )
  @Post()
  async postShowtime(
    @Request() req: TRequest,
    @Body() body: PostShowtimeBodyDTO,
  ) {
    const dto = ShowtimeMapper.toCreateRequest(body);
    const result = await this.showtimeService.createShowtime({
      ...dto,
      createdBy: req.user.id,
    });
    return ShowtimeMapper.toCreateResponse(result);
  }

  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions([PermissionAction.MANAGE, PermissionResource.SHOWTIME])
  @Patch(":showtime_id")
  async patchShowtime(
    @Param() params: PatchShowtimeParamsDTO,
    @Body() body: PatchShowtimeBodyDTO,
  ) {
    const dto = ShowtimeMapper.toUpdateRequest(params, body);
    const result = await this.showtimeService.updateShowtime(dto);
    return ShowtimeMapper.toUpdateResponse(result);
  }

  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions([PermissionAction.MANAGE, PermissionResource.SHOWTIME])
  @Delete(":showtime_id")
  async deleteShowtime(
    @Request() req: TRequest,
    @Param() params: DeleteShowtimeParamsDTO,
  ) {
    const result = await this.showtimeService.deleteShowtime({
      showtimeID: params.showtime_id,
      deletedBy: req.user.id,
    });
    return ShowtimeMapper.toDeleteResponse(result);
  }
}
