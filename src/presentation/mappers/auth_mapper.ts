import { type BaseSuccessfulResponse } from "src/shared/types/base_successful_response";
import { type LoginBodyDTO, type RegisterBodyDTO } from "../dtos/auth_dto";
import {
  type UserRegisterDTO,
  type UserRegisterResult,
} from "src/application/dtos/user_register_dto";
import {
  type UserLoginDTO,
  type UserLoginResult,
} from "src/application/dtos/user_login_dto";

export interface RegisterResponse {
  user_id: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export class AuthMapper {
  public static toRegisterRequest(body: RegisterBodyDTO): UserRegisterDTO {
    return {
      displayName: body.display_name,
      email: body.email,
      password: body.password,
    };
  }

  public static toRegisterResponse(
    result: UserRegisterResult,
  ): BaseSuccessfulResponse<RegisterResponse> {
    return {
      message: result.message,
      data: {
        user_id: result.userID,
      },
    };
  }

  public static toLoginRequest(body: LoginBodyDTO): UserLoginDTO {
    return {
      email: body.email,
      password: body.password,
    };
  }

  public static toLoginResponse(
    result: UserLoginResult,
  ): BaseSuccessfulResponse<LoginResponse> {
    return {
      message: result.message,
      data: {
        access_token: result.accessToken,
        refresh_token: result.refreshToken,
      },
    };
  }
}
