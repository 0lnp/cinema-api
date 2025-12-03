import { ClassProps } from "src/shared/types/class_props";
import { RefreshTokenID } from "../value_objects/token_id";
import { UserID } from "../value_objects/user_id";

type RefreshTokenIssueProps = Omit<
  ClassProps<RefreshToken>,
  "parentTokenID" | "issuedAt"
>;

export class RefreshToken {
  public static REFRESH_TOKEN_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000; // 7 days

  public readonly id: RefreshTokenID;
  public readonly userID: UserID;
  public readonly hashedToken: string;
  public readonly issuedAt: Date;

  public constructor(props: ClassProps<RefreshToken>) {
    this.id = props.id;
    this.userID = props.userID;
    this.hashedToken = props.hashedToken;
    this.issuedAt = props.issuedAt;
  }

  public static issue(props: RefreshTokenIssueProps): RefreshToken {
    const issuedAt = new Date();
    const token = new RefreshToken({
      id: props.id,
      userID: props.userID,
      hashedToken: props.hashedToken,
      issuedAt,
    });
    return token;
  }

  public rotate(id: RefreshTokenID, newHashedToken: string): RefreshToken {
    if (this.isExpired()) {
      throw new Error("Token is expired");
    }

    const newToken = RefreshToken.issue({
      id,
      userID: this.userID,
      hashedToken: newHashedToken,
    });
    return newToken;
  }

  private isExpired(): boolean {
    return (
      Date.now() - this.issuedAt.getTime() >
      RefreshToken.REFRESH_TOKEN_LIFETIME_MS
    );
  }
}
