import * as z from "zod";
import { CategoryID } from "src/domain/value_objects/category_id";

export const PostCategoryBodyDTOSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Category name is required" })
    .max(100, { message: "Category name must be at most 100 characters" }),
});

export type PostCategoryBodyDTO = z.infer<typeof PostCategoryBodyDTOSchema>;

export const CategoryIdParamsDTOSchema = z.object({
  id: z
    .string()
    .min(1, { message: "Category ID is required" })
    .regex(/^CAT_[\w-]+$/, { message: "Invalid category ID format" })
    .transform((value) => new CategoryID(value)),
});

export type CategoryIdParamsDTO = z.infer<typeof CategoryIdParamsDTOSchema>;
