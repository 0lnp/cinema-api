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

export class UserRegisterService {
  public constructor(
    @Inject(UserRepository.name)
    private readonly userRepository: UserRepository,
    @Inject(PasswordHasher.name)
    private readonly passwordHasher: PasswordHasher,
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

    const user = User.register({
      id: userID,
      displayName: dto.displayName,
      email: email,
      passwordHash: passwordHash,
      roleName: RoleName.CUSTOMER,
    });

    await this.userRepository.save(user);

    return {
      message: "User registered successfully",
      userID: userID.value,
    };
  }
}
