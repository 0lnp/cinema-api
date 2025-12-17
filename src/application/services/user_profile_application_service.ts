import { Inject } from "@nestjs/common";
import { UserRepository } from "src/domain/repositories/user_repository";
import {
  UserProfileDTO,
  UserProfileDTOSchema,
  UserProfileResult,
} from "../dtos/user_profile_dto";
import { validate } from "src/shared/utilities/validation";
import {
  ApplicationError,
  ApplicationErrorCode,
} from "src/shared/exceptions/application_error";

export class UserProfileApplicationService {
  public constructor(
    @Inject(UserRepository.name)
    private readonly userRepository: UserRepository,
  ) {}

  public async execute(request: UserProfileDTO): Promise<UserProfileResult> {
    const dto = validate(UserProfileDTOSchema, request);

    const user = await this.userRepository.userOfID(dto.userID);
    if (user === null) {
      throw new ApplicationError({
        message: "User not found",
        code: ApplicationErrorCode.RESOURCE_NOT_FOUND,
      });
    }

    return {
      id: user.id.value,
      displayName: user.displayName,
      email: user.email.value,
      roleName: user.roleName,
      lastLoginAt: user.lastLoginAt,
      registeredAt: user.registeredAt,
    };
  }
}
