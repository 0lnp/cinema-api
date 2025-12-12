import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY } from "../decorators/permissions";
import { Request } from "express";
import {
  Permission,
  PermissionAction,
  PermissionResource,
} from "src/domain/value_objects/permission";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<
      Array<[PermissionAction, PermissionResource]>
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermissions) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();

    if (!request.user) {
      throw new Error("request.user is undefined");
    }

    return requiredPermissions.some((permission) => {
      const p = new Permission(permission[0], permission[1]);
      return request.user.hasPermission(p);
    });
  }
}
