import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from "@nestjs/common";
import { PaginatedQuery, SortOrder } from "src/shared/types/pagination";

export interface PaginatedQueryRaw {
  page?: string;
  limit?: string;
  search?: string;
  sort_by?: string;
  sort_order?: string;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

@Injectable()
export class ParsePaginatedQueryPipe<T extends string = string>
  implements PipeTransform<PaginatedQueryRaw, PaginatedQuery<T>>
{
  private readonly allowedSortFields: T[];

  public constructor(allowedSortFields: T[] = []) {
    this.allowedSortFields = allowedSortFields;
  }

  public transform(
    value: PaginatedQueryRaw,
    _metadata: ArgumentMetadata,
  ): PaginatedQuery<T> {
    const page = this.parsePositiveInt(value.page, DEFAULT_PAGE, "page");
    const limit = Math.min(
      this.parsePositiveInt(value.limit, DEFAULT_LIMIT, "limit"),
      MAX_LIMIT,
    );
    const search = value.search?.trim() || undefined;
    const sort = this.parseSort(value.sort_by, value.sort_order);

    return {
      ...value,
      page,
      limit,
      search,
      sort,
    };
  }

  private parsePositiveInt(
    value: string | undefined,
    defaultValue: number,
    fieldName: string,
  ): number {
    if (value === undefined || value === "") {
      return defaultValue;
    }

    const parsed = parseInt(value, 10);

    if (isNaN(parsed) || parsed < 1) {
      throw new BadRequestException(`${fieldName} must be a positive integer`);
    }

    return parsed;
  }

  private parseSort(
    sortBy: string | undefined,
    sortOrder: string | undefined,
  ): { field: T; order: SortOrder } | undefined {
    if (!sortBy) {
      return undefined;
    }

    if (
      this.allowedSortFields.length > 0 &&
      !this.allowedSortFields.includes(sortBy as T)
    ) {
      throw new BadRequestException(
        `sort_by must be one of: ${this.allowedSortFields.join(", ")}`,
      );
    }

    const order: SortOrder =
      sortOrder?.toLowerCase() === "desc" ? "desc" : "asc";

    return {
      field: sortBy as T,
      order,
    };
  }
}
