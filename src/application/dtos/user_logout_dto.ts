import { UserID } from "src/domain/value_objects/user_id";
import * as z from "zod";

export const UserLogoutDTOSchema = z.object({
  userID: z.instanceof(UserID),
  accessToken: z.jwt(),
});

export type UserLogoutDTO = z.infer<typeof UserLogoutDTOSchema>;

export interface UserLogoutResult {
  message: string;
}
