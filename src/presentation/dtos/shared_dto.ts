import * as z from "zod";

export const PaginatedQueryDTOSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(10).default(10),
  search: z.string().max(255).optional(),
  sort_by: z.string().max(100).optional(),
  sort_order: z.enum(["asc", "desc"]).default("asc"),
});
