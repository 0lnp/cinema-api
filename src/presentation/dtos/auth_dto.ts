import * as z from "zod";

export const RegisterBodyDTOSchema = z.object({
  display_name: z
    .string()
    .min(2, { message: "Display name must be at least 2 characters" })
    .max(100, { message: "Display name must be at most 100 characters" }),
  full_name: z
    .string()
    .min(2, { message: "Full name must be at least 2 characters" })
    .max(200, { message: "Full name must be at most 200 characters" }),
  email: z.email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(100, { message: "Password must be at most 100 characters" })
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

export interface RegisterBodyDTO {
  display_name: string;
  full_name: string;
  email: string;
  password: string;
}

export const LoginBodyDTOSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .max(100, { message: "Password must be at most 100 characters" }),
});

export interface LoginBodyDTO {
  email: string;
  password: string;
}

export const RefreshBodyDTOSchema = z.object({
  refresh_token: z.jwt({ message: "Invalid refresh token format" }),
});

export interface RefreshBodyDTO {
  refresh_token: string;
}
