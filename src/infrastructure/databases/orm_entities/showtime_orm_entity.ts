import { type Money } from "src/domain/value_objects/money";
import { Column, Entity, ForeignKey, PrimaryColumn } from "typeorm";
import { MovieORMEntity } from "./movie_orm_entity";
import { ScreenORMEntity } from "./screen_orm_entity";
import { UserORMEntity } from "./user_orm_entity";

@Entity("showtimes")
export class ShowtimeORMEntity {
  @PrimaryColumn()
  public id!: string;
  @Column({ type: "varchar", name: "movie_id" })
  @ForeignKey(() => MovieORMEntity, "id")
  public movieID!: string;
  @Column({ type: "varchar", name: "screen_id" })
  @ForeignKey(() => ScreenORMEntity, "id")
  public screenID!: string;
  @Column({ type: "timestamp", name: "time_start" })
  public timeStart!: Date;
  @Column({ type: "timestamp", name: "time_end" })
  public timeEnd!: Date;
  @Column({ type: "jsonb" })
  public pricing!: Money;
  @Column({ type: "varchar", name: "status" })
  public status!: string;
  @Column({ type: "timestamp", name: "created_at" })
  public createdAt!: Date;
  @Column({ type: "varchar", name: "created_by" })
  @ForeignKey(() => UserORMEntity, "id")
  public createdBy!: string;
  @Column({ type: "timestamp", name: "last_modified_at" })
  public lastModifiedAt!: Date;
  @Column({ type: "timestamp", name: "deleted_at", nullable: true })
  public deletedAt!: Date | null;
  @Column({ type: "varchar", name: "deleted_by", nullable: true })
  @ForeignKey(() => UserORMEntity, "id")
  public deletedBy!: string | null;
}
