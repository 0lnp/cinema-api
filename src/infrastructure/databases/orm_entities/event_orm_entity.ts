import { Column, Entity, ForeignKey, ManyToOne, PrimaryColumn } from "typeorm";
import { UserORMEntity } from "./user_orm_entity";
import { CategoryORMEntity } from "./category_orm_entity";

@Entity("events")
export class EventORMEntity {
  @PrimaryColumn()
  public id!: string;
  @Column({ type: "varchar" })
  public type!: string;
  @Column({ type: "varchar" })
  public title!: string;
  @Column({ type: "text" })
  public description!: string;
  @Column({ type: "numeric", name: "duration_minutes" })
  public durationMinutes!: number;
  @Column({ type: "simple-array" })
  public genres!: string[];
  @Column({ type: "varchar", name: "poster_path", nullable: true })
  public posterPath!: string | null;
  @Column({ type: "varchar", nullable: true })
  public certificate!: string | null;
  @Column({ type: "numeric", name: "release_year", nullable: true })
  public releaseYear!: number | null;
  @Column({ type: "varchar" })
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
  @Column({ type: "varchar", name: "category_id", nullable: true })
  public categoryId!: string | null;
  @ManyToOne(() => CategoryORMEntity, { nullable: true })
  public category?: CategoryORMEntity;
}
