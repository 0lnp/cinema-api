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
import { MovieApplicationService } from "src/application/services/movie_application_service";
import { AuthGuard } from "../guards/auth_guard";
import { PermissionsGuard } from "../guards/permissions_guard";
import { Permissions } from "../decorators/permissions";
import {
  PermissionAction,
  PermissionResource,
} from "src/domain/value_objects/permission";
import { type Request as TRequest } from "express";
import {
  DeleteMovieParamsDTO,
  DeleteMovieParamsDTOSchema,
  GetMovieSearchExternalQueryDTO,
  GetMovieSearchExternalQueryDTOSchema,
  GetMoviesQueryDTO,
  GetMoviesQueryDTOSchema,
  PatchMovieIDBodyDTO,
  PatchMovieIDBodyDTOSchema,
  PatchMovieIDParamsDTO,
  PatchMovieIDParamsDTOSchema,
  PostMovieBodyDTO,
  PostMovieBodyDTOSchema,
  PostMovieSyncBodyDTO,
  PostMovieSyncBodyDTOSchema,
} from "../dtos/movie_dto";
import { MovieMapper } from "../mappers/movie_mapper";
import { ParsePaginatedQueryPipe } from "../pipes/parse_paginated_query_pipe";
import { MovieSortField } from "src/domain/repositories/movie_repository";
import { PaginatedQuery } from "src/shared/types/pagination";
import { ZodValidationPipe } from "../pipes/zod_validation_pipe";

@Controller("movies")
export class MovieController {
  public constructor(
    @Inject(MovieApplicationService.name)
    private readonly movieService: MovieApplicationService,
  ) {}

  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(
    [PermissionAction.CREATE, PermissionResource.MOVIE],
    [PermissionAction.MANAGE, PermissionResource.MOVIE],
  )
  @Post()
  async postMovie(
    @Request() req: TRequest,
    @Body(new ZodValidationPipe(PostMovieBodyDTOSchema)) body: PostMovieBodyDTO,
  ) {
    const dto = MovieMapper.toCreateRequest(body);
    const result = await this.movieService.create({
      ...dto,
      createdBy: req.user.id,
    });
    return MovieMapper.toCreateResponse(result);
  }

  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(
    [PermissionAction.VIEW, PermissionResource.MOVIE],
    [PermissionAction.VIEW_ALL, PermissionResource.MOVIE],
    [PermissionAction.MANAGE, PermissionResource.MOVIE],
  )
  @Get()
  @UsePipes(
    new ParsePaginatedQueryPipe<MovieSortField>([
      "title",
      "releaseYear",
      "createdAt",
      "durationMinutes",
    ]),
  )
  async getMovies(
    @Query(new ZodValidationPipe(GetMoviesQueryDTOSchema)) query: GetMoviesQueryDTO,
  ) {
    const { status, genre, release_year, ...paginatedQuery } =
      query as PaginatedQuery<MovieSortField> & GetMoviesQueryDTO;
    const result = await this.movieService.getAllMovies({
      query: paginatedQuery,
      filters: {
        status,
        genre,
        releaseYear: release_year,
      },
    });
    return MovieMapper.toGetAllResponse(result);
  }

  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(
    [PermissionAction.CREATE, PermissionResource.MOVIE],
    [PermissionAction.MANAGE, PermissionResource.MOVIE],
  )
  @Get("/search/external")
  async getMovieSearchExternal(
    @Query(new ZodValidationPipe(GetMovieSearchExternalQueryDTOSchema)) query: GetMovieSearchExternalQueryDTO,
  ) {
    const result = await this.movieService.searchFromExternal({
      keyword: query.v,
    });
    return MovieMapper.toSearchExternalResponse(result);
  }

  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(
    [PermissionAction.CREATE, PermissionResource.MOVIE],
    [PermissionAction.MANAGE, PermissionResource.MOVIE],
  )
  @Post("sync")
  async syncMovies(
    @Request() req: TRequest,
    @Body(new ZodValidationPipe(PostMovieSyncBodyDTOSchema)) body: PostMovieSyncBodyDTO,
  ) {
    const result = await this.movieService.createFromExternal({
      externalID: body.external_id,
      createdBy: req.user.id,
    });
    return MovieMapper.toCreateResponse(result);
  }

  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions([PermissionAction.MANAGE, PermissionResource.MOVIE])
  @Patch(":movie_id")
  async patchMovieID(
    @Param(new ZodValidationPipe(PatchMovieIDParamsDTOSchema)) params: PatchMovieIDParamsDTO,
    @Body(new ZodValidationPipe(PatchMovieIDBodyDTOSchema)) body: PatchMovieIDBodyDTO,
  ) {
    const dto = MovieMapper.toChangeStatusRequest(params, body);
    const result = await this.movieService.changeStatus(dto);
    return MovieMapper.toChangeStatusResponse(result);
  }

  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions([PermissionAction.MANAGE, PermissionResource.MOVIE])
  @Delete(":movie_id")
  async deleteMovieID(
    @Request() req: TRequest,
    @Param(new ZodValidationPipe(DeleteMovieParamsDTOSchema)) params: DeleteMovieParamsDTO,
  ) {
    const result = await this.movieService.deleteMovie({
      deletedBy: req.user.id,
      movieID: params.movie_id,
    });
    return MovieMapper.toDeleteResponse(result);
  }
}
