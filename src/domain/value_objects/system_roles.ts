import { type NonEmptyArray } from "src/shared/types/non_empty_array";
import { Permission, PermissionAction, PermissionResource } from "./permission";
import { RoleName } from "./role";

export class SystemRoles {
  public static allRolePermissions(): Record<
    RoleName,
    NonEmptyArray<Permission>
  > {
    const customerPermissions: NonEmptyArray<Permission> = [
      new Permission(PermissionAction.CREATE, PermissionResource.BOOKING),
      new Permission(PermissionAction.VIEW, PermissionResource.BOOKING),
      new Permission(PermissionAction.VIEW, PermissionResource.MOVIE),
      new Permission(PermissionAction.VIEW, PermissionResource.SHOWTIME),
    ];

    const boxOfficeStaffPermissions: NonEmptyArray<Permission> = [
      new Permission(PermissionAction.CREATE, PermissionResource.BOOKING),
      new Permission(PermissionAction.VIEW, PermissionResource.BOOKING),
      new Permission(PermissionAction.VIEW, PermissionResource.MOVIE),
      new Permission(PermissionAction.VIEW, PermissionResource.SHOWTIME),
    ];

    const managerPermissions: NonEmptyArray<Permission> = [
      ...boxOfficeStaffPermissions,
      new Permission(PermissionAction.MANAGE, PermissionResource.MOVIE),
      new Permission(PermissionAction.MANAGE, PermissionResource.SHOWTIME),
    ];

    const adminPermissions: NonEmptyArray<Permission> = [
      ...managerPermissions,
      new Permission(PermissionAction.MANAGE, PermissionResource.USER),
    ];

    return {
      [RoleName.CUSTOMER]: customerPermissions,
      [RoleName.BOX_OFFICE_STAFF]: boxOfficeStaffPermissions,
      [RoleName.MANAGER]: managerPermissions,
      [RoleName.ADMIN]: adminPermissions,
    };
  }

  public static rolePermissions(roleName: RoleName): NonEmptyArray<Permission> {
    return this.allRolePermissions()[roleName];
  }
}
