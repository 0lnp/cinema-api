import { type Role } from "./role";
import { type UserID } from "./user_id";

export type RoleAssignedBy = UserID | "system";

export class RoleAssignment {
  public constructor(
    public readonly role: Role,
    public readonly assignedAt: Date,
    public readonly assignedBy: RoleAssignedBy,
  ) {}
}
