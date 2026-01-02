import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { EventApplicationService } from "src/application/services/event_application_service";
import { AuthGuard } from "../guards/auth_guard";
import { PermissionsGuard } from "../guards/permissions_guard";
import { Permissions } from "../decorators/permissions";
import {
  PermissionAction,
  PermissionResource,
} from "src/domain/value_objects/permission";
import { type Request as TRequest } from "express";
import {
  DeleteEventParamsDTO,
  DeleteEventParamsDTOSchema,
  EventIdParamsDTO,
  EventIdParamsDTOSchema,
  GetEventSearchExternalQueryDTO,
  GetEventSearchExternalQueryDTOSchema,
  GetEventsQueryDTO,
  GetEventsQueryDTOSchema,
  PatchEventIDBodyDTO,
  PatchEventIDBodyDTOSchema,
  PatchEventIDParamsDTO,
  PatchEventIDParamsDTOSchema,
  PostEventBodyDTO,
  PostEventBodyDTOSchema,
  PostEventSyncBodyDTO,
  PostEventSyncBodyDTOSchema,
  SetCategoryBodyDTO,
  SetCategoryBodyDTOSchema,
} from "../dtos/event_dto";
import { EventMapper } from "../mappers/event_mapper";
import { ParsePaginatedQueryPipe } from "../pipes/parse_paginated_query_pipe";
import { EventSortField } from "src/domain/repositories/event_repository";
import { PaginatedQuery } from "src/shared/types/pagination";
import { ZodValidationPipe } from "../pipes/zod_validation_pipe";
import { CategoryID } from "src/domain/value_objects/category_id";

@Controller("events")
export class EventController {
  public constructor(
    @Inject(EventApplicationService.name)
    private readonly eventService: EventApplicationService,
  ) {}

  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(
    [PermissionAction.CREATE, PermissionResource.MOVIE],
    [PermissionAction.MANAGE, PermissionResource.MOVIE],
  )
  @Post()
  async postEvent(
    @Request() req: TRequest,
    @Body(new ZodValidationPipe(PostEventBodyDTOSchema)) body: PostEventBodyDTO,
  ) {
    const dto = EventMapper.toCreateRequest(body);
    const result = await this.eventService.create({
      ...dto,
      createdBy: req.user.id,
    });
    return EventMapper.toCreateResponse(result);
  }

  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(
    [PermissionAction.VIEW, PermissionResource.MOVIE],
    [PermissionAction.VIEW_ALL, PermissionResource.MOVIE],
    [PermissionAction.MANAGE, PermissionResource.MOVIE],
  )
  @Get()
  @UsePipes(
    new ParsePaginatedQueryPipe<EventSortField>([
      "title",
      "releaseYear",
      "createdAt",
      "durationMinutes",
    ]),
  )
  async getEvents(
    @Query(new ZodValidationPipe(GetEventsQueryDTOSchema)) query: GetEventsQueryDTO,
  ) {
    const { status, genre, release_year, ...paginatedQuery } =
      query as PaginatedQuery<EventSortField> & GetEventsQueryDTO;
    const result = await this.eventService.getAllEvents({
      query: paginatedQuery,
      filters: {
        status,
        genre,
        releaseYear: release_year,
      },
    });
    return EventMapper.toGetAllResponse(result);
  }

  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(
    [PermissionAction.CREATE, PermissionResource.MOVIE],
    [PermissionAction.MANAGE, PermissionResource.MOVIE],
  )
  @Get("/search/external")
  async getEventSearchExternal(
    @Query(new ZodValidationPipe(GetEventSearchExternalQueryDTOSchema)) query: GetEventSearchExternalQueryDTO,
  ) {
    const result = await this.eventService.searchFromExternal({
      keyword: query.v,
    });
    return EventMapper.toSearchExternalResponse(result);
  }

  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(
    [PermissionAction.CREATE, PermissionResource.MOVIE],
    [PermissionAction.MANAGE, PermissionResource.MOVIE],
  )
  @Post("sync")
  async syncEvents(
    @Request() req: TRequest,
    @Body(new ZodValidationPipe(PostEventSyncBodyDTOSchema)) body: PostEventSyncBodyDTO,
  ) {
    const result = await this.eventService.createFromExternal({
      externalID: body.external_id,
      createdBy: req.user.id,
    });
    return EventMapper.toCreateResponse(result);
  }

  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions([PermissionAction.MANAGE, PermissionResource.MOVIE])
  @Patch(":event_id")
  async patchEventID(
    @Param(new ZodValidationPipe(PatchEventIDParamsDTOSchema)) params: PatchEventIDParamsDTO,
    @Body(new ZodValidationPipe(PatchEventIDBodyDTOSchema)) body: PatchEventIDBodyDTO,
  ) {
    const dto = EventMapper.toChangeStatusRequest(params, body);
    const result = await this.eventService.changeStatus(dto);
    return EventMapper.toChangeStatusResponse(result);
  }

  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions([PermissionAction.MANAGE, PermissionResource.MOVIE])
  @Delete(":event_id")
  async deleteEventID(
    @Request() req: TRequest,
    @Param(new ZodValidationPipe(DeleteEventParamsDTOSchema)) params: DeleteEventParamsDTO,
  ) {
    const result = await this.eventService.deleteEvent({
      deletedBy: req.user.id,
      eventID: params.event_id,
    });
    return EventMapper.toDeleteResponse(result);
  }

  // ==================== Category Management ====================

  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions([PermissionAction.MANAGE, PermissionResource.MOVIE])
  @Put(":event_id/category")
  @HttpCode(HttpStatus.OK)
  async setEventCategory(
    @Param(new ZodValidationPipe(EventIdParamsDTOSchema)) params: EventIdParamsDTO,
    @Body(new ZodValidationPipe(SetCategoryBodyDTOSchema)) body: SetCategoryBodyDTO,
  ) {
    const result = await this.eventService.setEventCategory({
      eventID: params.event_id,
      categoryID: body.category_id ? new CategoryID(body.category_id) : null,
    });
    return EventMapper.toSetCategoryResponse(result);
  }
}

