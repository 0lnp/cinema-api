import * as z from "zod";

export const RegisterDTOSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email(),
  password: z
    .string()
    .min(8)
    .max(100)
    .refine((password) => /[a-z]/.test(password), {
      message: "Password must contain at least one lowercase letter",
    })
    .refine((password) => /[A-Z]/.test(password), {
      message: "Password must contain at least one uppercase letter",
    })
    .refine((password) => /[0-9]/.test(password), {
      message: "Password must contain at least one number",
    })
    .refine(
      (password) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      { message: "Password must contain at least one special character" },
    ),
});

export type RegisterDTO = z.infer<typeof RegisterDTOSchema>;

export interface RegisterResult {
  userID: string;
}

export const LoginDTOSchema = z.object({
  email: z.email(),
  password: z.string().max(100),
});

export type LoginDTO = z.infer<typeof LoginDTOSchema>;

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
}
