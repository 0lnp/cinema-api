import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import {
  ApplicationError,
  ApplicationErrorCode,
} from "src/shared/exceptions/application_error";
import {
  InvariantError,
  InvariantErrorCode,
} from "src/shared/exceptions/invariant_error";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  public constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  public catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    const {
      status: statusCode,
      message,
      errors,
    } = this.mapException(exception);

    const responseBody = {
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      errors,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, statusCode);
  }

  private mapException(exception: unknown): {
    status: HttpStatus;
    message: string;
    errors?: Record<string, any>;
  } {
    if (
      exception instanceof HttpException &&
      !(exception instanceof InternalServerErrorException)
    ) {
      return this.handleHttpException(exception);
    }

    const internalServerError = {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "An unexpected error occurred. Please try again later.",
    };

    if (exception instanceof InvariantError) {
      switch (exception.code) {
        case InvariantErrorCode.INVALID_EMAIL_FORMAT:
          return {
            status: HttpStatus.BAD_REQUEST,
            message: exception.message,
          };
        case InvariantErrorCode.EMAIL_ALREADY_EXISTS:
          return {
            status: HttpStatus.CONFLICT,
            message: exception.message,
          };
        case InvariantErrorCode.ROLE_ASSIGNMENT_FAILED:
          return {
            status: HttpStatus.FORBIDDEN,
            message: exception.message,
          };
        default:
          return internalServerError;
      }
    }

    if (exception instanceof ApplicationError) {
      switch (exception.code) {
        case ApplicationErrorCode.VALIDATION_ERROR:
          return {
            status: HttpStatus.BAD_REQUEST,
            message: exception.message,
            errors: exception.details,
          };
        case ApplicationErrorCode.INVALID_CREDENTIALS:
          return {
            status: HttpStatus.UNAUTHORIZED,
            message: exception.message,
          };
        default:
          return internalServerError;
      }
    }

    return internalServerError;
  }

  private handleHttpException(exception: HttpException): {
    status: HttpStatus;
    message: string;
    error?: Record<string, any>;
  } {
    const status = exception.getStatus();
    const response = exception.getResponse();

    if (typeof response === "object" && response !== null) {
      const { message } = response as { message: string };
      return {
        status,
        message: message || exception.message,
      };
    }

    return {
      status,
      message: typeof response === "string" ? response : exception.message,
    };
  }
}
