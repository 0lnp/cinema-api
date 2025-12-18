import { Column, Entity, ForeignKey, PrimaryColumn } from "typeorm";
import { ScreenORMEntity } from "./screen_orm_entity";
import { ShowtimeORMEntity } from "./showtime_orm_entity";

export interface SeatJSON {
  seatNumber: string;
  status: string;
  heldBy: string | null;
  heldUntil: string | null;
}

@Entity("seat_inventories")
export class SeatInventoryORMEntity {
  @PrimaryColumn()
  public id!: string;
  @Column({ type: "varchar", name: "screen_id" })
  @ForeignKey(() => ScreenORMEntity, "id")
  public screenId!: string;
  @Column({ type: "varchar", name: "showtime_id", unique: true })
  @ForeignKey(() => ShowtimeORMEntity, "id")
  public showtimeId!: string;
  @Column({ type: "jsonb" })
  public seats!: SeatJSON[];
  @Column({ type: "timestamp", name: "created_at" })
  public createdAt!: Date;
  @Column({ type: "timestamp", name: "last_modified_at" })
  public lastModifiedAt!: Date;
}
