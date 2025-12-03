import { Body, Controller, Inject, Post } from "@nestjs/common";
import {
  AUTHENTICATION_APPLICATION_SERVICE_TOKEN,
  AuthenticationApplicationService,
} from "src/application/services/authentication_application_service";
import { LoginBodyDTO, RegisterBodyDTO } from "../dtos/auth_dto";
import { AuthMapper } from "../mappers/auth_mapper";

@Controller("auth")
export class AuthController {
  public constructor(
    @Inject(AUTHENTICATION_APPLICATION_SERVICE_TOKEN)
    private readonly authenticationApplicationService: AuthenticationApplicationService,
  ) {}

  @Post("register")
  async postAuthRegister(@Body() body: RegisterBodyDTO) {
    const result = await this.authenticationApplicationService.register({
      name: body.name,
      email: body.email,
      password: body.password,
    });

    return AuthMapper.toRegisterResponse(result);
  }

  @Post("login")
  async postAuthLogin(@Body() body: LoginBodyDTO) {
    const result = await this.authenticationApplicationService.login({
      email: body.email,
      password: body.password,
    });

    return AuthMapper.toLoginResponse(result);
  }
}
