import { type ClassProps } from "src/shared/types/class_props";
import { type UserID } from "../value_objects/user_id";
import { RoleAssignment } from "../value_objects/role_assignment";
import { ScryptPasswordHash } from "src/shared/utilities/scrypt_password_hash";
import { InvariantError, InvariantErrorType } from "src/errors/invariant_error";
import { Role, RoleName } from "../value_objects/role";
import { SystemRoles } from "../value_objects/system_roles";
import { Permission } from "../value_objects/permission";

type UserRegisterProps = Omit<
  ClassProps<User>,
  "lastLoginAt" | "loginAttempts" | "updatedAt" | "hashedPassword"
> & { plainPassword: string };

export class User {
  public readonly id: UserID;
  public readonly displayName: string;
  public readonly emailAddress: string;
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

  public static async register(props: UserRegisterProps) {
    this.validatePasswordStrength(props.plainPassword);

    const hashedPassword = await ScryptPasswordHash.hash(props.plainPassword);
    const roleName = RoleName.CUSTOMER;
    const rolePermissions = SystemRoles.rolePermissions(roleName);
    const roleAssignment = new RoleAssignment(
      new Role(roleName, rolePermissions),
      props.createdAt,
      "system",
    );

    return new User({
      id: props.id,
      displayName: props.displayName,
      emailAddress: props.emailAddress,
      hashedPassword,
      roleAssignment,
      lastLoginAt: null,
      loginAttempts: 0,
      createdAt: props.createdAt,
      updatedAt: props.createdAt,
    });
  }

  public async login(plainPassword: string): Promise<boolean> {
    const isValidPassword = await ScryptPasswordHash.verify(
      plainPassword,
      this.hashedPassword,
    );
    if (!isValidPassword) return false;

    this.recordLoginAttempt();
    return true;
  }

  public recordLoginAttempt() {
    const now = new Date();
    this._lastLoginAt = now;
    this._loginAttempts++;
    this._updatedAt = now;
  }

  public changeRole(role: Role, assignedBy: UserID | "system") {
    if (this.roleAssignment.role === role)
      throw new InvariantError({
        message: "User already has this role",
        type: InvariantErrorType.ROLE_ASSIGNING_ERROR,
      });

    const now = new Date();
    const roleAssignment = new RoleAssignment(role, now, assignedBy);
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

  private static validatePasswordStrength(password: string) {
    const requireLowercase = /(?=.*[a-z])/;
    const requireUppercase = /(?=.*[A-Z])/;
    const requireNumber = /(?=.*[0-9])/;
    const requireSpecial = /(?=.*[!@#$%^&*()_+])/;
    const requireLength = /^(?=.{8,})/;

    if (!requireLowercase.test(password))
      throw new InvariantError({
        message: "Password must contain at least one lowercase letter",
        type: InvariantErrorType.PASSWORD_STRENGTH_ERROR,
      });
    if (!requireUppercase.test(password))
      throw new InvariantError({
        message: "Password must contain at least one uppercase letter",
        type: InvariantErrorType.PASSWORD_STRENGTH_ERROR,
      });
    if (!requireNumber.test(password))
      throw new InvariantError({
        message: "Password must contain at least one number",
        type: InvariantErrorType.PASSWORD_STRENGTH_ERROR,
      });
    if (!requireSpecial.test(password))
      throw new InvariantError({
        message: "Password must contain at least one special character",
        type: InvariantErrorType.PASSWORD_STRENGTH_ERROR,
      });
    if (!requireLength.test(password))
      throw new InvariantError({
        message: "Password must be at least 8 characters long",
        type: InvariantErrorType.PASSWORD_STRENGTH_ERROR,
      });
  }
}
