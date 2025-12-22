import { type BaseSuccessfulResponse } from "src/shared/types/base_successful_response";
import {
  RefreshBodyDTO,
  type LoginBodyDTO,
  type RegisterBodyDTO,
} from "../dtos/auth_dto";
import {
  type UserRegisterDTO,
  type UserRegisterResult,
} from "src/application/dtos/user_register_dto";
import {
  type UserLoginDTO,
  type UserLoginResult,
} from "src/application/dtos/user_login_dto";
import {
  RefreshTokenDTO,
  RefreshTokenResult,
} from "src/application/dtos/refresh_token_dto";
import { type UserProfileResult } from "src/application/dtos/user_profile_dto";

export interface RegisterResponse {
  user_id: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
}

export interface ProfileResponse {
  id: string;
  display_name: string;
  email: string;
  role_name: string;
  last_login_at: string | null;
  registered_at: string;
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

  public static toRefreshRequest(body: RefreshBodyDTO): RefreshTokenDTO {
    return {
      refreshToken: body.refresh_token,
    };
  }

  public static toRefreshResponse(
    result: RefreshTokenResult,
  ): BaseSuccessfulResponse<RefreshResponse> {
    return {
      message: result.message,
      data: {
        access_token: result.accessToken,
        refresh_token: result.refreshToken,
      },
    };
  }

  public static toProfileResponse(
    result: UserProfileResult,
  ): BaseSuccessfulResponse<ProfileResponse> {
    return {
      message: "Profile retrieved successfully",
      data: {
        id: result.id,
        display_name: result.displayName,
        email: result.email,
        role_name: result.roleName,
        last_login_at: result.lastLoginAt?.toISOString() ?? null,
        registered_at: result.registeredAt.toISOString(),
      },
    };
  }
}
