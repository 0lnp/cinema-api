import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger("HTTP");

  use(req: Request, res: Response, next: NextFunction): void {
    const requestID = randomUUID();
    req["requestID"] = requestID;

    const startTime = Date.now();
    const { method, originalUrl } = req;

    this.logger.log({
      event: "REQUEST_START",
      requestID,
      method,
      url: originalUrl,
      userAgent: this.sanitizeUserAgent(req.headers["user-agent"]),
      timestamp: new Date().toISOString(),
    });

    res.on("finish", () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;

      const logData = {
        event: "REQUEST_END",
        requestID,
        method,
        url: originalUrl,
        statusCode,
        duration: `${duration}ms`,
        user: req.user?.id.value ?? "guest",
        timestamp: new Date().toISOString(),
      };

      if (statusCode >= 500) {
        this.logger.error(logData);
      } else if (statusCode >= 400) {
        this.logger.warn(logData);
      } else {
        this.logger.log(logData);
      }
    });

    next();
  }

  private sanitizeUserAgent(userAgent?: string): string {
    if (!userAgent) return "unknown";
    return userAgent;
  }
}
