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
  UsePipes,
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
  DeleteShowtimeParamsDTOSchema,
  GetShowtimeParamsDTO,
  GetShowtimeParamsDTOSchema,
  GetShowtimesQueryDTO,
  GetShowtimesQueryDTOSchema,
  PatchShowtimeBodyDTO,
  PatchShowtimeBodyDTOSchema,
  PatchShowtimeParamsDTO,
  PatchShowtimeParamsDTOSchema,
  PostShowtimeBodyDTO,
  PostShowtimeBodyDTOSchema,
} from "../dtos/showtime_dto";
import { ShowtimeMapper } from "../mappers/showtime_mapper";
import { ParsePaginatedQueryPipe } from "../pipes/parse_paginated_query_pipe";
import { ShowtimeSortField } from "src/domain/repositories/showtime_repository";
import { PaginatedQuery } from "src/shared/types/pagination";
import { ZodValidationPipe } from "../pipes/zod_validation_pipe";

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
  @UsePipes(
    new ParsePaginatedQueryPipe<ShowtimeSortField>([
      "timeStart",
      "createdAt",
      "basePrice",
    ]),
  )
  async getShowtimes(
    @Query(new ZodValidationPipe(GetShowtimesQueryDTOSchema))
    query: GetShowtimesQueryDTO,
  ) {
    const { screen_id, event_id, date, status, ...paginatedQuery } =
      query as PaginatedQuery<ShowtimeSortField> & GetShowtimesQueryDTO;
    const result = await this.showtimeService.getAllShowtimes({
      query: paginatedQuery,
      filters: {
        screenID: screen_id,
        eventID: event_id,
        date,
        status,
      },
    });
    return ShowtimeMapper.toGetAllResponse(result);
  }

  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(
    [PermissionAction.VIEW, PermissionResource.SHOWTIME],
    [PermissionAction.VIEW_ALL, PermissionResource.SHOWTIME],
    [PermissionAction.MANAGE, PermissionResource.SHOWTIME],
  )
  @Get(":showtime_id")
  async getShowtime(
    @Param(new ZodValidationPipe(GetShowtimeParamsDTOSchema))
    params: GetShowtimeParamsDTO,
  ) {
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
    @Body(new ZodValidationPipe(PostShowtimeBodyDTOSchema))
    body: PostShowtimeBodyDTO,
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
    @Param(new ZodValidationPipe(PatchShowtimeParamsDTOSchema))
    params: PatchShowtimeParamsDTO,
    @Body(new ZodValidationPipe(PatchShowtimeBodyDTOSchema))
    body: PatchShowtimeBodyDTO,
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
    @Param(new ZodValidationPipe(DeleteShowtimeParamsDTOSchema))
    params: DeleteShowtimeParamsDTO,
  ) {
    const result = await this.showtimeService.deleteShowtime({
      showtimeID: params.showtime_id,
      deletedBy: req.user.id,
    });
    return ShowtimeMapper.toDeleteResponse(result);
  }
}
