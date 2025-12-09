import * as z from "zod";

export const RefreshTokenDTOSchema = z.object({
  refreshToken: z.jwt(),
});

export type RefreshTokenDTO = z.infer<typeof RefreshTokenDTOSchema>;

export interface RefreshTokenResult {
  message: string;
  accessToken: string;
  refreshToken: string;
}
