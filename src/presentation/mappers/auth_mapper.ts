import {
  LoginResult,
  RegisterResult,
} from "src/application/dtos/authentication_dto";
import { BaseSuccessfulResponse } from "src/shared/types/base_successful_response";

export interface RegisterResponse {
  user_id: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export class AuthMapper {
  public static toRegisterResponse(
    result: RegisterResult,
  ): BaseSuccessfulResponse<RegisterResponse> {
    return {
      data: {
        user_id: result.userID,
      },
    };
  }

  public static toLoginResponse(
    result: LoginResult,
  ): BaseSuccessfulResponse<LoginResponse> {
    return {
      data: {
        access_token: result.accessToken,
        refresh_token: result.refreshToken,
      },
    };
  }
}
