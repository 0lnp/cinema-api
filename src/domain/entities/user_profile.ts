import { UserID } from "../value_objects/user_id";
import { type ClassProps } from "src/shared/types/class_props";

type UserProfileCreateProps = Omit<ClassProps<UserProfile>, "createdAt">;

export class UserProfile {
  public readonly userId: UserID;
  public readonly fullName: string;
  public readonly phoneNumber: string | null;
  public readonly address: string | null;
  public readonly createdAt: Date;

  public constructor(props: ClassProps<UserProfile>) {
    this.userId = props.userId;
    this.fullName = props.fullName;
    this.phoneNumber = props.phoneNumber;
    this.address = props.address;
    this.createdAt = props.createdAt;
  }

  public static create(props: UserProfileCreateProps): UserProfile {
    return new UserProfile({
      userId: props.userId,
      fullName: props.fullName,
      phoneNumber: props.phoneNumber,
      address: props.address,
      createdAt: new Date(),
    });
  }
}
