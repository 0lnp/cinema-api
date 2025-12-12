import { type ClassProps } from "src/shared/types/class_props";
import { type UserID } from "../value_objects/user_id";
import { type Email } from "../value_objects/email";
import { RoleName, SystemRoles } from "../value_objects/system_roles";
import { Permission } from "../value_objects/permission";

type UserRegisterProps = Omit<ClassProps<User>, "lastLoginAt" | "registeredAt">;

export class User {
  public readonly id: UserID;
  public readonly displayName: string;
  public readonly email: Email;
  public readonly passwordHash: string;
  public readonly roleName: RoleName;
  private _lastLoginAt: Date | null;
  public readonly registeredAt: Date;

  public constructor(props: ClassProps<User>) {
    this.id = props.id;
    this.displayName = props.displayName;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.roleName = props.roleName;
    this._lastLoginAt = props.lastLoginAt;
    this.registeredAt = props.registeredAt;
  }

  public static register(props: UserRegisterProps) {
    const now = new Date();
    return new User({
      id: props.id,
      displayName: props.displayName,
      email: props.email,
      passwordHash: props.passwordHash,
      roleName: RoleName.CUSTOMER,
      lastLoginAt: null,
      registeredAt: now,
    });
  }

  public hasPermission(permission: Permission): boolean {
    const rolePermissions = SystemRoles.rolePermissions(this.roleName);
    return rolePermissions.some((rp) => rp.implies(permission));
  }

  public get lastLoginAt(): Date | null {
    return this._lastLoginAt;
  }
}
