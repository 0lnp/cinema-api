import * as z from "zod";

export const UserRegisterDTOSchema = z.object({
  displayName: z.string().min(2).max(100),
  fullName: z.string().min(2).max(200),
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

export type UserRegisterDTO = z.infer<typeof UserRegisterDTOSchema>;

export interface UserRegisterResult {
  message: string;
  userID: string;
}
