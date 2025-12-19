import { SeatRow } from "src/domain/value_objects/seat_layout";
import { Column, Entity, ForeignKey, PrimaryColumn } from "typeorm";
import { UserORMEntity } from "./user_orm_entity";

@Entity("screens")
export class ScreenORMEntity {
  @PrimaryColumn()
  public id!: string;
  @Column({ type: "varchar", length: 100 })
  public name!: string;
  @Column({ type: "jsonb", name: "seat_rows" })
  public seatRows!: SeatRow[];
  @Column({ type: "numeric" })
  public capacity!: number;
  @Column({ type: "varchar", name: "created_by" })
  @ForeignKey(() => UserORMEntity, "id")
  public createdBy!: string;
  @Column({ type: "timestamp", name: "created_at" })
  public createdAt!: Date;
  @Column({ type: "timestamp", name: "last_modified_at" })
  public lastModifiedAt!: Date;
  @Column({ type: "timestamp", name: "deleted_at", nullable: true })
  public deletedAt!: Date | null;
  @Column({ type: "varchar", name: "deleted_by", nullable: true })
  @ForeignKey(() => UserORMEntity, "id")
  public deletedBy!: string | null;
}
