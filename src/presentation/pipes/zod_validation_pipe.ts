import { PipeTransform, Injectable, ArgumentMetadata } from "@nestjs/common";
import * as z from "zod";
import {
  ApplicationError,
  ApplicationErrorCode,
} from "src/shared/exceptions/application_error";

@Injectable()
export class ZodValidationPipe<T extends z.ZodType> implements PipeTransform {
  public constructor(private readonly schema: T) {}

  public transform(value: unknown, _metadata: ArgumentMetadata): z.infer<T> {
    const result = this.schema.safeParse(value);

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
}
