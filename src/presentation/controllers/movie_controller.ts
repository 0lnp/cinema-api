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
  GetMovieSearchQueryDTO,
  PatchMovieIDBodyDTO,
  PatchMovieIDParamsDTO,
  PostMovieBodyDTO,
  PostMovieSyncBodyDTO,
} from "../dtos/movie_dto";
import { MovieMapper } from "../mappers/movie_mapper";

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
  async postMovie(@Request() req: TRequest, @Body() body: PostMovieBodyDTO) {
    const dto = MovieMapper.toCreateRequest(body);
    const result = await this.movieService.create({
      ...dto,
      createdBy: req.user.id,
    });
    return MovieMapper.toCreateResponse(result);
  }

  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(
    [PermissionAction.CREATE, PermissionResource.MOVIE],
    [PermissionAction.MANAGE, PermissionResource.MOVIE],
  )
  @Get("search")
  async getMovieSearch(@Query() query: GetMovieSearchQueryDTO) {
    const result = await this.movieService.searchFromExternal({
      keyword: query.v,
    });
    return MovieMapper.toSearchResponse(result);
  }

  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(
    [PermissionAction.CREATE, PermissionResource.MOVIE],
    [PermissionAction.MANAGE, PermissionResource.MOVIE],
  )
  @Post("sync")
  async syncMovies(
    @Request() req: TRequest,
    @Body() body: PostMovieSyncBodyDTO,
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
    @Param() params: PatchMovieIDParamsDTO,
    @Body() body: PatchMovieIDBodyDTO,
  ) {
    const dto = MovieMapper.toChangeStatusRequest(params, body);
    const result = await this.movieService.changeStatus(dto);
    return MovieMapper.toChangeStatusResponse(result);
  }

  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions([PermissionAction.MANAGE, PermissionResource.MOVIE])
  @Delete(":movie_id")
  async deleteScreenID(
    @Request() req: TRequest,
    @Param() params: DeleteMovieParamsDTO,
  ) {
    const result = await this.movieService.deleteMovie({
      deletedBy: req.user.id,
      movieID: params.movie_id,
    });
    return MovieMapper.toDeleteResponse(result);
  }
}
