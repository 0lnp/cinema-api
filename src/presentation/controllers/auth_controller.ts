import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Request,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import {
  RefreshBodyDTO,
  RefreshBodyDTOSchema,
  LoginBodyDTOSchema,
  RegisterBodyDTOSchema,
  type LoginBodyDTO,
  type RegisterBodyDTO,
} from "../dtos/auth_dto";
import { AuthMapper } from "../mappers/auth_mapper";
import { UserRegisterApplicationService } from "src/application/services/user_register_application_service";
import { UserLoginApplicationService } from "src/application/services/user_login_application_service";
import { RefreshTokenApplicationService } from "src/application/services/refresh_token_application_service";
import { UserLogoutApplicationService } from "src/application/services/user_logout_application_service";
import { UserProfileApplicationService } from "src/application/services/user_profile_application_service";
import { AuthGuard } from "../guards/auth_guard";
import { type Request as TRequest } from "express";
import { ZodValidationPipe } from "../pipes/zod_validation_pipe";

@Controller("auth")
export class AuthController {
  public constructor(
    @Inject(UserRegisterApplicationService.name)
    private readonly userRegisterService: UserRegisterApplicationService,
    @Inject(UserLoginApplicationService.name)
    private readonly userLoginService: UserLoginApplicationService,
    @Inject(RefreshTokenApplicationService.name)
    private readonly refreshTokenService: RefreshTokenApplicationService,
    @Inject(UserLogoutApplicationService.name)
    private readonly userLogoutService: UserLogoutApplicationService,
    @Inject(UserProfileApplicationService.name)
    private readonly userProfileService: UserProfileApplicationService,
  ) {}

  @Post("register")
  @UsePipes(new ZodValidationPipe(RegisterBodyDTOSchema))
  async postAuthRegister(@Body() body: RegisterBodyDTO) {
    const request = AuthMapper.toRegisterRequest(body);
    const result = await this.userRegisterService.execute(request);
    return AuthMapper.toRegisterResponse(result);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(LoginBodyDTOSchema))
  async postAuthLogin(@Body() body: LoginBodyDTO) {
    const request = AuthMapper.toLoginRequest(body);
    const result = await this.userLoginService.execute(request);
    return AuthMapper.toLoginResponse(result);
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(RefreshBodyDTOSchema))
  async postAuthRefresh(@Body() body: RefreshBodyDTO) {
    const request = AuthMapper.toRefreshRequest(body);
    const result = await this.refreshTokenService.execute(request);
    return AuthMapper.toRefreshResponse(result);
  }

  @UseGuards(AuthGuard)
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async postAuthLogout(@Request() req: TRequest) {
    const result = await this.userLogoutService.execute({
      userID: req.user.id,
      accessToken: req.accessToken,
    });
    return AuthMapper.toLogoutResponse(result);
  }

  @UseGuards(AuthGuard)
  @Get("profile")
  async getAuthProfile(@Request() req: TRequest) {
    const result = await this.userProfileService.execute({
      userID: req.user.id,
    });
    return AuthMapper.toProfileResponse(result);
  }
}
