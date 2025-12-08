import { type ClassProps } from "src/shared/types/class_props";
import { type TokenID } from "../value_objects/token_id";
import { type UserID } from "../value_objects/user_id";
import {
  InvariantError,
  InvariantErrorCode,
} from "src/shared/exceptions/invariant_error";

type RefreshTokenIssueProps = Omit<ClassProps<RefreshToken>, "issuedAt">;

export enum TokenStatus {
  ACTIVE = "ACTIVE",
  ROTATED = "ROTATED",
  REVOKED = "REVOKED",
}

export class RefreshToken {
  public readonly id: TokenID;
  public readonly userID: UserID;
  public readonly tokenHash: string;
  public readonly tokenFamily: TokenID;
  private _status: TokenStatus;
  public readonly issuedAt: Date;
  public readonly expiresAt: Date;

  public constructor(props: ClassProps<RefreshToken>) {
    this.id = props.id;
    this.userID = props.userID;
    this.tokenHash = props.tokenHash;
    this.tokenFamily = props.tokenFamily;
    this._status = props.status;
    this.issuedAt = props.issuedAt;
    this.expiresAt = props.expiresAt;
  }

  public static issue(props: RefreshTokenIssueProps): RefreshToken {
    const now = new Date();

    const token = new RefreshToken({
      id: props.id,
      userID: props.userID,
      tokenHash: props.tokenHash,
      tokenFamily: props.tokenFamily,
      status: TokenStatus.ACTIVE,
      issuedAt: now,
      expiresAt: props.expiresAt,
    });

    return token;
  }

  public rotate(props: RefreshTokenIssueProps): RefreshToken {
    if (this.status !== TokenStatus.ACTIVE) {
      throw new InvariantError({
        code: InvariantErrorCode.ROTATION_NOT_PERMITTED,
        message: "Cannot rotate inactive token",
      });
    }

    if (this.expiresAt.getTime() < new Date().getTime()) {
      throw new InvariantError({
        code: InvariantErrorCode.ROTATION_NOT_PERMITTED,
        message: "Cannot rotate expired token",
      });
    }

    this._status = TokenStatus.ROTATED;

    const newToken = RefreshToken.issue({
      id: props.id,
      userID: this.userID,
      tokenHash: this.tokenHash,
      tokenFamily: this.tokenFamily,
      status: TokenStatus.ACTIVE,
      expiresAt: props.expiresAt,
    });

    return newToken;
  }

  public revoke(): void {
    if (this.status !== TokenStatus.ACTIVE) {
      throw new InvariantError({
        code: InvariantErrorCode.REVOCATION_NOT_PERMITTED,
        message: "Cannot revoke inactive token",
      });
    }

    this._status = TokenStatus.REVOKED;
  }

  public get status(): TokenStatus {
    return this._status;
  }
}
