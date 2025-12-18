import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SeatInventoryRepository } from "src/domain/repositories/seat_inventory_repository";
import { SeatInventory } from "src/domain/aggregates/seat_inventory";
import { SeatInventoryID } from "src/domain/value_objects/seat_inventory_id";
import { ShowtimeID } from "src/domain/value_objects/showtime_id";
import { ScreenID } from "src/domain/value_objects/screen_id";
import { BookingID } from "src/domain/value_objects/booking_id";
import { Seat } from "src/domain/entities/seat";
import { SeatStatus } from "src/domain/value_objects/seat_status";
import {
  SeatInventoryORMEntity,
  SeatJSON,
} from "../databases/orm_entities/seat_inventory_orm_entity";
import {
  InfrastructureError,
  InfrastructureErrorCode,
} from "src/shared/exceptions/infrastructure_error";

export class TypeormSeatInventoryRepository implements SeatInventoryRepository {
  public constructor(
    @InjectRepository(SeatInventoryORMEntity)
    private readonly ormRepository: Repository<SeatInventoryORMEntity>,
  ) {}

  public async inventoryOfID(
    id: SeatInventoryID,
  ): Promise<SeatInventory | null> {
    const entity = await this.ormRepository.findOneBy({ id: id.value });
    return entity !== null ? this.toDomain(entity) : null;
  }

  public async inventoryOfShowtime(
    showtimeId: ShowtimeID,
  ): Promise<SeatInventory | null> {
    const entity = await this.ormRepository.findOneBy({
      showtimeId: showtimeId.value,
    });
    return entity !== null ? this.toDomain(entity) : null;
  }

  public async nextIdentity(): Promise<SeatInventoryID> {
    const maxAttempts = 3;
    let attempt = 0;

    while (attempt < maxAttempts) {
      const id = SeatInventoryID.generate();
      const exists = await this.ormRepository.existsBy({ id: id.value });

      if (!exists) {
        return id;
      }

      attempt++;
    }

    throw new InfrastructureError({
      code: InfrastructureErrorCode.ID_GENERATION_FAILED,
      message: `Failed to generate unique SeatInventoryID after ${maxAttempts} attempts`,
    });
  }

  public async save(inventory: SeatInventory): Promise<void> {
    const entity = this.toPersistence(inventory);
    await this.ormRepository.save(entity);
  }

  private toDomain(entity: SeatInventoryORMEntity): SeatInventory {
    const seats = new Map<string, Seat>();

    for (const seatJson of entity.seats) {
      const seat = new Seat({
        seatNumber: seatJson.seatNumber,
        status: seatJson.status as SeatStatus,
        heldBy:
          seatJson.heldBy !== null ? new BookingID(seatJson.heldBy) : null,
        heldUntil:
          seatJson.heldUntil !== null ? new Date(seatJson.heldUntil) : null,
      });
      seats.set(seatJson.seatNumber, seat);
    }

    return new SeatInventory({
      id: new SeatInventoryID(entity.id),
      screenId: new ScreenID(entity.screenId),
      showtimeId: new ShowtimeID(entity.showtimeId),
      seats,
      createdAt: entity.createdAt,
      lastModifiedAt: entity.lastModifiedAt,
    });
  }

  private toPersistence(inventory: SeatInventory): SeatInventoryORMEntity {
    const seats: SeatJSON[] = [];

    for (const seat of inventory.seats.values()) {
      seats.push({
        seatNumber: seat.seatNumber,
        status: seat.status,
        heldBy: seat.heldBy?.value ?? null,
        heldUntil: seat.heldUntil?.toISOString() ?? null,
      });
    }

    return {
      id: inventory.id.value,
      screenId: inventory.screenId.value,
      showtimeId: inventory.showtimeId.value,
      seats,
      createdAt: inventory.createdAt,
      lastModifiedAt: inventory.lastModifiedAt,
    };
  }
}
