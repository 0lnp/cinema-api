import { type ClassProps } from "src/shared/types/class_props";
import { PasswordHash } from "src/shared/utilities/password_hash";

type UserRegisterProps = Omit<
  ClassProps<User>,
  "lastLoginAt" | "loginAttempts" | "updatedAt" | "hashedPassword"
> & { plainPassword: string };

export class User {
  public readonly id: string;
  public readonly displayName: string;
  public readonly emailAddress: string;
  public readonly hashedPassword: string;
  // private _roleIDs:
  private _lastLoginAt: Date | null;
  private _loginAttempts: number;
  public readonly createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: ClassProps<User>) {
    this.id = props.id;
    this.displayName = props.displayName;
    this.emailAddress = props.emailAddress;
    this.hashedPassword = props.hashedPassword;
    this._lastLoginAt = props.lastLoginAt;
    this._loginAttempts = props.loginAttempts;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  public static async register(props: UserRegisterProps) {
    return new User({
      id: props.id,
      displayName: props.displayName,
      emailAddress: props.emailAddress,
      hashedPassword: await PasswordHash.hash(props.plainPassword),
      lastLoginAt: null,
      loginAttempts: 0,
      createdAt: props.createdAt,
      updatedAt: props.createdAt,
    });
  }

  public async login(hashedPassword: string): Promise<boolean> {
    const isValidPassword = await PasswordHash.verify(
      this.hashedPassword,
      hashedPassword,
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
