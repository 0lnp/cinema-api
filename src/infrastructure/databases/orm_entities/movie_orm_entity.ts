import { type ORMEntity } from "src/shared/types/orm_entity";
import { Column, Entity, ForeignKey, PrimaryColumn } from "typeorm";
import { Movie } from "src/domain/aggregates/movie";
import { UserORMEntity } from "./user_orm_entity";

@Entity("movies")
export class MovieORMEntity implements ORMEntity<Movie> {
  @PrimaryColumn()
  public id!: string;
  @Column({ type: "varchar" })
  public title!: string;
  @Column({ type: "text" })
  public synopsis!: string;
  @Column({ type: "numeric", name: "duration_minutes" })
  public durationMinutes!: number;
  @Column({ type: "simple-array" })
  public genres!: string[];
  @Column({ type: "varchar" })
  public certificate!: string;
  @Column({ type: "numeric", name: "release_year" })
  public releaseYear!: number;
  @Column({ type: "varchar", name: "poster_path" })
  public posterPath!: string;
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
}
