import { type User } from "../aggregates/user";
import { type ClassProps } from "src/shared/types/class_props";

export type FindOneProps = Partial<
  Pick<ClassProps<User>, "id" | "emailAddress">
>;

export abstract class UserRepository {
  abstract findOne(props: FindOneProps): Promise<User | null>;
}
