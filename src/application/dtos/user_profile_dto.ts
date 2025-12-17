import { UserID } from "src/domain/value_objects/user_id";
import * as z from "zod";

export const UserProfileDTOSchema = z.object({
  userID: z.instanceof(UserID),
});

export type UserProfileDTO = z.infer<typeof UserProfileDTOSchema>;

export interface UserProfileResult {
  id: string;
  displayName: string;
  email: string;
  roleName: string;
  lastLoginAt: Date | null;
  registeredAt: Date;
}
