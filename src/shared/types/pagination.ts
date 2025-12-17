export type SortOrder = "asc" | "desc";

export interface SortOption<T extends string = string> {
  field: T;
  order: SortOrder;
}

export interface PaginatedQuery<T extends string = string> {
  page: number;
  limit: number;
  search?: string;
  sort?: SortOption<T>;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
