import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Response } from "express";

@Injectable()
export class StatusCodeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: unknown) => {
        const response = context.switchToHttp().getResponse<Response>();
        const statusCode = response.statusCode;

        if (data && typeof data === "object" && !Array.isArray(data)) {
          return { status_code: statusCode, ...data };
        }

        return data;
      }),
    );
  }
}
