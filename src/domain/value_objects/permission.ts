export enum PermissionResource {
  USER = "USER",
  MOVIE = "MOVIE",
  SHOWTIME = "SHOWTIME",
  BOOKING = "BOOKING",
  SCREEN = "SCREEN",
}

export enum PermissionAction {
  CREATE = "CREATE",
  VIEW = "VIEW",
  VIEW_ALL = "VIEW_ALL",
  MANAGE = "MANAGE",
}

export class Permission {
  public constructor(
    private readonly action: PermissionAction,
    private readonly resource: PermissionResource,
  ) {}

  public implies(other: Permission): boolean {
    const isSameAction = this.action === other.action;
    const isSameResource = this.resource === other.resource;
    if (isSameAction && isSameResource) return true;
    return false;
  }
}
