import { type NonEmptyArray } from "src/shared/types/non_empty_array";
import { type Permission } from "./permission";

export enum RoleName {
  CUSTOMER = "CUSTOMER",
  BOX_OFFICE_STAFF = "BOX_OFFICE_STAFF",
  MANAGER = "MANAGER",
  ADMIN = "ADMIN",
}

export class Role {
  public constructor(
    public readonly name: RoleName,
    public readonly permissions: NonEmptyArray<Permission>,
  ) {}

  public hasPermission(permission: Permission): boolean {
    return this.permissions.includes(permission);
  }
}
