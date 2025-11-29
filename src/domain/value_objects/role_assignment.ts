import { type Role } from "./role";
import { type UserID } from "./user_id";

export class RoleAssignment {
  public constructor(
    public readonly role: Role,
    public readonly assignedAt: Date,
    public readonly assignedBy: UserID | "system",
  ) {}
}
