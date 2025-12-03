import { type ClassProps } from "src/shared/types/class_props";
import { type UserID } from "../value_objects/user_id";
import {
  type RoleAssignedBy,
  RoleAssignment,
} from "../value_objects/role_assignment";
import { Role, RoleName } from "../value_objects/role";
import { SystemRoles } from "../value_objects/system_roles";
import { Permission } from "../value_objects/permission";
import { EmailAddress } from "../value_objects/email_address";
import {
  InvariantError,
  InvariantErrorCode,
} from "src/shared/exceptions/invariant_error";

type UserRegisterProps = Omit<
  ClassProps<User>,
  "lastLoginAt" | "loginAttempts" | "createdAt" | "updatedAt"
>;

export class User {
  public readonly id: UserID;
  public readonly displayName: string;
  public readonly emailAddress: EmailAddress;
  public readonly hashedPassword: string;
  private _roleAssignment: RoleAssignment;
  private _lastLoginAt: Date | null;
  private _loginAttempts: number;
  public readonly createdAt: Date;
  private _updatedAt: Date;

  public constructor(props: ClassProps<User>) {
    this.id = props.id;
    this.displayName = props.displayName;
    this.emailAddress = props.emailAddress;
    this.hashedPassword = props.hashedPassword;
    this._roleAssignment = props.roleAssignment;
    this._lastLoginAt = props.lastLoginAt;
    this._loginAttempts = props.loginAttempts;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  public static register(props: UserRegisterProps) {
    const createdAt = new Date();

    const roleName = RoleName.CUSTOMER;
    const rolePermissions = SystemRoles.rolePermissions(roleName);
    const roleAssignment = new RoleAssignment(
      new Role(roleName, rolePermissions),
      createdAt,
      "system",
    );

    return new User({
      id: props.id,
      displayName: props.displayName,
      emailAddress: props.emailAddress,
      hashedPassword: props.hashedPassword,
      roleAssignment,
      lastLoginAt: null,
      loginAttempts: 0,
      createdAt: createdAt,
      updatedAt: createdAt,
    });
  }

  public recordSuccessfulAuthentication() {
    const now = new Date();
    this._lastLoginAt = now;
    this._loginAttempts++;
    this._updatedAt = now;
  }

  public assignRole(newRole: Role, assignedBy: RoleAssignedBy) {
    if (this.roleAssignment.role === newRole) {
      throw new InvariantError({
        code: InvariantErrorCode.ROLE_ASSIGNMENT_FAILED,
        message: "User already has this role",
      });
    }

    if (assignedBy !== "system" && this.id.value === assignedBy.value) {
      throw new InvariantError({
        code: InvariantErrorCode.ROLE_ASSIGNMENT_FAILED,
        message: "Cannot assign role to self",
      });
    }

    const now = new Date();
    const roleAssignment = new RoleAssignment(newRole, now, assignedBy);
    this._roleAssignment = roleAssignment;
    this._updatedAt = new Date();
  }

  public hasPermission(user: User, permissionString: string): boolean {
    const permission = Permission.fromString(permissionString);
    return user.roleAssignment.role.hasPermission(permission);
  }

  public get roleAssignment(): RoleAssignment {
    return this._roleAssignment;
  }
  public get lastLoginAt(): Date | null {
    return this._lastLoginAt;
  }
  public get loginAttempts(): number {
    return this._loginAttempts;
  }
  public get updatedAt(): Date {
    return this._updatedAt;
  }
}
