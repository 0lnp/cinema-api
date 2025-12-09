import { type UserRepository } from "src/domain/repositories/user_repository";
import { Repository } from "typeorm";
import { User } from "src/domain/aggregates/user";
import { Email } from "src/domain/value_objects/email";
import { RoleName } from "src/domain/value_objects/system_roles";
import { UserID } from "src/domain/value_objects/user_id";
import { InjectRepository } from "@nestjs/typeorm";
import {
  InfrastructureError,
  InfrastructureErrorCode,
} from "src/shared/exceptions/infrastructure_error";
import { UserORMEntity } from "../databases/orm_entities/user_orm_entity";

export class TypeORMUserRepository implements UserRepository {
  public constructor(
    @InjectRepository(UserORMEntity)
    private readonly ormRepository: Repository<UserORMEntity>,
  ) {}

  public async userOfEmail(email: Email): Promise<User | null> {
    const user = await this.ormRepository.findOneBy({ email: email.value });
    return user !== null ? this.toDomain(user) : null;
  }

  public async existsByEmail(email: Email): Promise<boolean> {
    const exists = await this.ormRepository.existsBy({ email: email.value });
    return exists;
  }

  public async save(user: User): Promise<void> {
    const userORMEntity = this.toPersistence(user);
    await this.ormRepository.save(userORMEntity);
  }

  public async nextIdentity(): Promise<UserID> {
    const maxAttempts = 3;
    let attempt = 0;

    while (attempt < maxAttempts) {
      const id = UserID.generate();
      const exists = await this.ormRepository.existsBy({ id: id.value });

      if (!exists) {
        return id;
      }

      attempt++;
    }

    throw new InfrastructureError({
      code: InfrastructureErrorCode.ID_GENERATION_FAILED,
      message: `Failed to generate unique UserID after ${maxAttempts} attempts`,
    });
  }

  public async userOfID(id: UserID): Promise<User | null> {
    const user = await this.ormRepository.findOneBy({ id: id.value });
    return user !== null ? this.toDomain(user) : null;
  }

  private toDomain(user: UserORMEntity): User {
    return new User({
      id: new UserID(user.id),
      displayName: user.displayName,
      email: new Email(user.email),
      passwordHash: user.passwordHash,
      roleName: user.roleName as RoleName,
      lastLoginAt: user.lastLoginAt,
      registeredAt: user.registeredAt,
    });
  }

  private toPersistence(user: User): UserORMEntity {
    return {
      id: user.id.value,
      displayName: user.displayName,
      email: user.email.value,
      passwordHash: user.passwordHash,
      roleName: user.roleName,
      lastLoginAt: user.lastLoginAt,
      registeredAt: user.registeredAt,
    };
  }
}
