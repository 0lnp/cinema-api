export enum PermissionResource {
  USER = "USER",
  MOVIE = "MOVIE",
  SHOWTIME = "SHOWTIME",
  BOOKING = "BOOKING",
}

export enum PermissionAction {
  CREATE = "CREATE",
  VIEW = "VIEW",
  VIEW_ALL = "VIEW_ALL",
  MANAGE = "MANAGE",
}

export class Permission {
  public constructor(
    public readonly action: PermissionAction,
    public readonly resource: PermissionResource,
  ) {}

  public implies(other: Permission): boolean {
    const isSameResource = this.resource === other.resource;
    const isSameAction = this.action === other.action;
    if (isSameResource && isSameAction) return true;
    return false;
  }

  public toString(): string {
    const resource = this.resource.toLowerCase();
    const action = this.action.toLowerCase();
    return `${resource}:${action}`;
  }

  public static fromString(permissionString: string): Permission {
    const [resource, action] = permissionString.split(":");
    if (!resource || !action) throw new Error("Invalid permission string");
    return new Permission(
      action.toUpperCase() as PermissionAction,
      resource.toUpperCase() as PermissionResource,
    );
  }
}
