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
    private readonly action: PermissionAction,
    private readonly resource: PermissionResource,
  ) {}

  public implies(other: Permission): boolean {
    const isSameAction = this.action === other.action;
    const isSameResource = this.resource === other.resource;
    if (isSameAction && isSameResource) return true;
    return false;
  }

  public toString(): string {
    const normalizedAction = this.action.toLowerCase();
    const normalizedResource = this.resource.toLowerCase();
    return `${normalizedAction}:${normalizedResource}`;
  }

  public static fromString(permissionString: string): Permission {
    const [action, resource] = permissionString.split(":");
    if (!action?.trim().length || !resource?.trim().length) {
      throw new Error("Invalid permission string");
    }

    const normalizedAction = action.toUpperCase() as PermissionAction;
    const normalizedResource = resource.toUpperCase() as PermissionResource;
    return new Permission(normalizedAction, normalizedResource);
  }
}
