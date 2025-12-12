import { SetMetadata } from "@nestjs/common";
import {
  PermissionAction,
  PermissionResource,
} from "src/domain/value_objects/permission";

export const PERMISSIONS_KEY = "permissions";

export const Permissions = (
  ...permissions: Array<[PermissionAction, PermissionResource]>
) => {
  return SetMetadata(PERMISSIONS_KEY, permissions);
};
