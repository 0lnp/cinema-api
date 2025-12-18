import { SeatInventory } from "../aggregates/seat_inventory";
import { SeatInventoryID } from "../value_objects/seat_inventory_id";
import { ShowtimeID } from "../value_objects/showtime_id";

export abstract class SeatInventoryRepository {
  public abstract inventoryOfID(
    id: SeatInventoryID,
  ): Promise<SeatInventory | null>;
  public abstract inventoryOfShowtime(
    showtimeId: ShowtimeID,
  ): Promise<SeatInventory | null>;
  public abstract nextIdentity(): Promise<SeatInventoryID>;
  public abstract save(inventory: SeatInventory): Promise<void>;
}
