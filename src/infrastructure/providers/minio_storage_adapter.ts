import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Client } from "minio";
import { randomUUID } from "node:crypto";
import { ObjectStorage } from "src/domain/ports/object_storage";
import { StoragePath } from "src/domain/value_objects/storage_path";
import { TicketDownloadLink } from "src/domain/value_objects/ticket_download_link";
import {
  InfrastructureError,
  InfrastructureErrorCode,
} from "src/shared/exceptions/infrastructure_error";
import { AppConfig } from "../configs/app_config";

interface MinioRequestLogContext {
  operation: string;
  params: Record<string, unknown>;
}

@Injectable()
export class MinioStorageAdapter implements ObjectStorage {
  private readonly logger = new Logger(MinioStorageAdapter.name);
  private readonly client: Client;

  public constructor(config: ConfigService<AppConfig, true>) {
    this.client = new Client({
      endPoint: config.get("MINIO_ENDPOINT", { infer: true }),
      port: config.get("MINIO_PORT", { infer: true }),
      useSSL: config.get("MINIO_USE_SSL", { infer: true }),
      accessKey: config.get("MINIO_ACCESS_KEY", { infer: true }),
      secretKey: config.get("MINIO_SECRET_KEY", { infer: true }),
    });
  }

  public async upload(
    bucket: string,
    key: string,
    content: Buffer,
    contentType: string,
  ): Promise<StoragePath> {
    return this.executeWithLogging(
      {
        operation: "upload",
        params: { bucket, key, contentType, contentSize: content.length },
      },
      async () => {
        const bucketExists = await this.client.bucketExists(bucket);
        if (!bucketExists) {
          this.logger.log({
            event: "MINIO_BUCKET_CREATE",
            bucket,
            message: `Bucket "${bucket}" does not exist, creating...`,
          });
          await this.client.makeBucket(bucket);
        }

        await this.client.putObject(bucket, key, content, content.length, {
          "Content-Type": contentType,
        });

        return StoragePath.create(bucket, key);
      },
    );
  }

  public async download(path: StoragePath): Promise<Buffer> {
    return this.executeWithLogging(
      {
        operation: "download",
        params: { bucket: path.bucket, key: path.objectKey },
      },
      async () => {
        const stream = await this.client.getObject(path.bucket, path.objectKey);
        const chunks: Buffer[] = [];

        return new Promise((resolve, reject) => {
          stream.on("data", (chunk: Buffer) => chunks.push(chunk));
          stream.on("end", () => {
            const buffer = Buffer.concat(chunks);
            this.logger.debug({
              event: "MINIO_DOWNLOAD_SIZE",
              bucket: path.bucket,
              key: path.objectKey,
              size: buffer.length,
            });
            resolve(buffer);
          });
          stream.on("error", reject);
        });
      },
    );
  }

  public async generatePresignedDownloadUrl(
    path: StoragePath,
    expirationSeconds: number,
  ): Promise<TicketDownloadLink> {
    return this.executeWithLogging(
      {
        operation: "generatePresignedDownloadUrl",
        params: {
          bucket: path.bucket,
          key: path.objectKey,
          expirationSeconds,
        },
      },
      async () => {
        const url = await this.client.presignedGetObject(
          path.bucket,
          path.objectKey,
          expirationSeconds,
        );

        const expiresAt = new Date(Date.now() + expirationSeconds * 1000);
        return TicketDownloadLink.create(url, expiresAt);
      },
    );
  }

  public async delete(path: StoragePath): Promise<void> {
    return this.executeWithLogging(
      {
        operation: "delete",
        params: { bucket: path.bucket, key: path.objectKey },
      },
      async () => {
        await this.client.removeObject(path.bucket, path.objectKey);
      },
    );
  }

  private async executeWithLogging<T>(
    context: MinioRequestLogContext,
    operation: () => Promise<T>,
  ): Promise<T> {
    const requestId = randomUUID();
    const startTime = Date.now();

    this.logger.log({
      event: "MINIO_REQUEST_START",
      requestId,
      operation: context.operation,
      params: context.params,
      timestamp: new Date().toISOString(),
    });

    try {
      const result = await operation();
      const duration = Date.now() - startTime;

      this.logger.log({
        event: "MINIO_REQUEST_END",
        requestId,
        operation: context.operation,
        duration: `${duration}ms`,
        success: true,
        timestamp: new Date().toISOString(),
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error({
        event: "MINIO_REQUEST_ERROR",
        requestId,
        operation: context.operation,
        params: context.params,
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
        errorStack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      });

      throw new InfrastructureError({
        code: InfrastructureErrorCode.STORAGE_ERROR,
        message: `MinIO ${context.operation} failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        details: { requestId, operation: context.operation, ...context.params },
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  }
}
