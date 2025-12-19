import { InjectRepository } from "@nestjs/typeorm";
import { ScreenRepository } from "src/domain/repositories/screen_repository";
import { ScreenORMEntity } from "../databases/orm_entities/screen_orm_entity";
import { IsNull, Repository } from "typeorm";
import { Screen } from "src/domain/aggregates/screen";
import { ScreenID } from "src/domain/value_objects/screen_id";
import {
  InfrastructureError,
  InfrastructureErrorCode,
} from "src/shared/exceptions/infrastructure_error";
import { UserID } from "src/domain/value_objects/user_id";
import { SeatLayout } from "src/domain/value_objects/seat_layout";

export class TypeORMScreenRepository implements ScreenRepository {
  public constructor(
    @InjectRepository(ScreenORMEntity)
    private readonly ormRepository: Repository<ScreenORMEntity>,
  ) {}

  public async screenOfID(id: ScreenID): Promise<Screen | null> {
    const screen = await this.ormRepository.findOneBy({
      id: id.value,
      deletedAt: IsNull(),
    });
    return screen !== null ? this.toDomain(screen) : null;
  }

  public async save(screen: Screen): Promise<void> {
    const screenEntity = this.toPersistence(screen);
    await this.ormRepository.save(screenEntity);
  }

  public async nextIdentity(): Promise<ScreenID> {
    const maxAttempts = 3;
    let attempt = 0;

    while (attempt < maxAttempts) {
      const id = ScreenID.generate();
      const exists = await this.ormRepository.existsBy({ id: id.value });

      if (!exists) {
        return id;
      }

      attempt++;
    }

    throw new InfrastructureError({
      code: InfrastructureErrorCode.ID_GENERATION_FAILED,
      message: `Failed to generate unique ScreenID after ${maxAttempts} attempts`,
    });
  }

  private toDomain(screen: ScreenORMEntity): Screen {
    return new Screen({
      id: new ScreenID(screen.id),
      name: screen.name,
      seatLayout: SeatLayout.create(screen.seatRows),
      createdBy: new UserID(screen.createdBy),
      createdAt: screen.createdAt,
      lastModifiedAt: screen.lastModifiedAt,
      deletedAt: screen.deletedAt,
      deletedBy:
        screen.deletedBy !== null ? new UserID(screen.deletedBy) : null,
    });
  }

  private toPersistence(screen: Screen): ScreenORMEntity {
    return {
      id: screen.id.value,
      name: screen.name,
      seatRows: screen.seatLayout.rows,
      capacity: screen.seatLayout.totalSeats,
      createdBy: screen.createdBy.value,
      createdAt: screen.createdAt,
      lastModifiedAt: screen.lastModifiedAt,
      deletedAt: screen.deletedAt,
      deletedBy: screen.deletedBy?.value ?? null,
    };
  }
}
