import * as z from "zod";
import {
  ApplicationError,
  ApplicationErrorCode,
} from "../exceptions/application_error";

export function validate<T extends z.ZodObject<any>>(
  schema: T,
  value: unknown,
) {
  const result = schema.safeParse(value);

  if (!result.success) {
    const flattened = z.flattenError(result.error);
    throw new ApplicationError({
      code: ApplicationErrorCode.VALIDATION_ERROR,
      message: "Input invalid",
      details: flattened,
    });
  }

  return result.data;
}
