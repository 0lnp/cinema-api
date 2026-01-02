import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from "typeorm";

@Entity("categories")
export class CategoryORMEntity {
  @PrimaryColumn()
  public id!: string;
  @Column({ type: "varchar", length: 100 })
  public name!: string;
  @Column({ type: "varchar", name: "parent_id", nullable: true })
  public parentId!: string | null;
  @ManyToOne(() => CategoryORMEntity, (category) => category.children, {
    nullable: true,
  })
  @JoinColumn({ name: "parent_id" })
  public parent!: CategoryORMEntity | null;
  @OneToMany(() => CategoryORMEntity, (category) => category.parent)
  public children!: CategoryORMEntity[];
  @Column({ type: "varchar", length: 500 })
  public path!: string;
  @Column({ type: "integer", default: 0 })
  public level!: number;
  @Column({ type: "timestamp", name: "created_at" })
  public createdAt!: Date;
}
