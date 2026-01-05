import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { UserORMEntity } from "./user_orm_entity";

@Entity("user_profiles")
export class UserProfileORMEntity {
  @PrimaryColumn({ name: "user_id" })
  public userId!: string;
  @OneToOne(() => UserORMEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  public user!: UserORMEntity;
  @Column({ type: "varchar", length: 200, name: "full_name" })
  public fullName!: string;
  @Column({ type: "varchar", length: 20, name: "phone_number", nullable: true })
  public phoneNumber!: string | null;
  @Column({ type: "text", nullable: true })
  public address!: string | null;
  @Column({ type: "timestamp", name: "created_at" })
  public createdAt!: Date;
}
