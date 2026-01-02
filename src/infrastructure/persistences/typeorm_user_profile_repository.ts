import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserProfileRepository } from "src/domain/repositories/user_profile_repository";
import { UserProfile } from "src/domain/entities/user_profile";
import { UserID } from "src/domain/value_objects/user_id";
import { UserProfileORMEntity } from "../databases/orm_entities/user_profile_orm_entity";

export class TypeormUserProfileRepository implements UserProfileRepository {
  public constructor(
    @InjectRepository(UserProfileORMEntity)
    private readonly ormRepository: Repository<UserProfileORMEntity>,
  ) {}

  public async profileOfUser(userId: UserID): Promise<UserProfile | null> {
    const entity = await this.ormRepository.findOneBy({
      userId: userId.value,
    });
    return entity !== null ? this.toDomain(entity) : null;
  }

  public async save(profile: UserProfile): Promise<void> {
    const entity = this.toPersistence(profile);
    await this.ormRepository.save(entity);
  }

  private toDomain(entity: UserProfileORMEntity): UserProfile {
    return new UserProfile({
      userId: new UserID(entity.userId),
      fullName: entity.fullName,
      phoneNumber: entity.phoneNumber,
      address: entity.address,
      createdAt: entity.createdAt,
    });
  }

  private toPersistence(profile: UserProfile): UserProfileORMEntity {
    const entity = new UserProfileORMEntity();
    entity.userId = profile.userId.value;
    entity.fullName = profile.fullName;
    entity.phoneNumber = profile.phoneNumber;
    entity.address = profile.address;
    entity.createdAt = profile.createdAt;
    return entity;
  }
}
