import { validate } from "src/shared/utilities/validation";
import {
  UserRegisterDTO,
  UserRegisterDTOSchema,
  UserRegisterResult,
} from "../dtos/user_register_dto";
import { UserRepository } from "src/domain/repositories/user_repository";
import {
  ApplicationError,
  ApplicationErrorCode,
} from "src/shared/exceptions/application_error";
import { User } from "src/domain/aggregates/user";
import { Email } from "src/domain/value_objects/email";
import { RoleName } from "src/domain/value_objects/system_roles";
import { Inject } from "@nestjs/common";
import { PasswordHasher } from "src/domain/ports/password_hasher";
import { UnitOfWork } from "src/domain/ports/unit_of_work";
import { UserProfileRepository } from "src/domain/repositories/user_profile_repository";
import { UserProfile } from "src/domain/entities/user_profile";

export class UserRegisterApplicationService {
  public constructor(
    @Inject(UserRepository.name)
    private readonly userRepository: UserRepository,
    @Inject(PasswordHasher.name)
    private readonly passwordHasher: PasswordHasher,
    @Inject(UnitOfWork.name)
    private readonly unitOfWork: UnitOfWork,
    @Inject(UserProfileRepository.name)
    private readonly userProfileRepository: UserProfileRepository,
  ) {}

  public async execute(request: UserRegisterDTO): Promise<UserRegisterResult> {
    const dto = validate(UserRegisterDTOSchema, request);
    const email = Email.create(dto.email);

    const exists = await this.userRepository.existsByEmail(email);
    if (exists) {
      throw new ApplicationError({
        code: ApplicationErrorCode.EMAIL_ALREADY_EXISTS,
        message: "User with this email already exists",
      });
    }

    const userID = await this.userRepository.nextIdentity();
    const passwordHash = await this.passwordHasher.hash(dto.password);

    return this.unitOfWork.runInTransaction(async () => {
      const user = User.register({
        id: userID,
        displayName: dto.displayName,
        email: email,
        passwordHash: passwordHash,
        roleName: RoleName.CUSTOMER,
      });

      await this.userRepository.save(user);

      const profile = UserProfile.create({
        userId: userID,
        fullName: dto.fullName,
        phoneNumber: null,
        address: null,
      });

      await this.userProfileRepository.save(profile);

      return {
        message: "User registered successfully",
        userID: userID.value,
      };
    });
  }
}

