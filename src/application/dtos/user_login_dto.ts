import * as z from "zod";

export const UserLoginDTOSchema = z.object({
  email: z.email(),
  password: z.string().max(100),
});

export type UserLoginDTO = z.infer<typeof UserLoginDTOSchema>;

export interface UserLoginResult {
  message: string;
  accessToken: string;
  refreshToken: string;
}
