import { RoleName } from "src/domain/value_objects/role";
import { type UserID } from "src/domain/value_objects/user_id";

export interface JWTClaims {
  sub: UserID;
  role: RoleName;
  iat: number;
  exp: number;
}
