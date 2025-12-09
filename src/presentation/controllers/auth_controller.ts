import { Body, Controller, Inject, Post } from "@nestjs/common";
import {
  RefreshBodyDTO,
  type LoginBodyDTO,
  type RegisterBodyDTO,
} from "../dtos/auth_dto";
import { AuthMapper } from "../mappers/auth_mapper";
import { UserRegisterApplicationService } from "src/application/services/user_register_application_service";
import { UserLoginApplicationService } from "src/application/services/user_login_application_service";
import { RefreshTokenApplicationService } from "src/application/services/refresh_token_application_service";

@Controller("auth")
export class AuthController {
  public constructor(
    @Inject(UserRegisterApplicationService.name)
    private readonly userRegisterService: UserRegisterApplicationService,
    @Inject(UserLoginApplicationService.name)
    private readonly userLoginService: UserLoginApplicationService,
    @Inject(RefreshTokenApplicationService.name)
    private readonly refreshTokenService: RefreshTokenApplicationService,
  ) {}

  @Post("register")
  async postAuthRegister(@Body() body: RegisterBodyDTO) {
    const request = AuthMapper.toRegisterRequest(body);
    const result = await this.userRegisterService.execute(request);
    return AuthMapper.toRegisterResponse(result);
  }

  @Post("login")
  async postAuthLogin(@Body() body: LoginBodyDTO) {
    const request = AuthMapper.toLoginRequest(body);
    const result = await this.userLoginService.execute(request);
    return AuthMapper.toLoginResponse(result);
  }

  @Post("refresh")
  async postAuthRefresh(@Body() body: RefreshBodyDTO) {
    const request = AuthMapper.toRefreshRequest(body);
    const result = await this.refreshTokenService.execute(request);
    return AuthMapper.toRefreshResponse(result);
  }
}
