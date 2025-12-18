import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "node:crypto";
import {
  PaymentGateway,
  PaymentRequest,
  PaymentResponse,
  PaymentResult,
  PaymentStatus,
  WebhookPayload,
} from "src/domain/ports/payment_gateway";
import {
  InfrastructureError,
  InfrastructureErrorCode,
} from "src/shared/exceptions/infrastructure_error";
import { validate } from "src/shared/utilities/validation";
import { ApplicationError } from "src/shared/exceptions/application_error";
import { AppConfig } from "../configs/app_config";
import {
  XenditInvoiceResponseDTO,
  XenditInvoiceResponseDTOSchema,
  XenditInvoiceStatusResponseDTOSchema,
} from "./dtos/xendit_payment_adapter_dto";

interface XenditConfig {
  apiKey: string;
  baseUrl: string;
  webhookToken: string;
  requestTimeoutMs: number;
}

interface XenditRequestLogContext {
  operation: string;
  url: string;
  params: Record<string, unknown>;
}

@Injectable()
export class XenditPaymentAdapter implements PaymentGateway {
  private readonly logger = new Logger(XenditPaymentAdapter.name);
  private readonly xenditConfig: XenditConfig;

  public constructor(config: ConfigService<AppConfig, true>) {
    this.xenditConfig = {
      apiKey: config.get("XENDIT_API_KEY", { infer: true }),
      baseUrl: config.get("XENDIT_BASE_URL", { infer: true }),
      webhookToken: config.get("XENDIT_WEBHOOK_TOKEN", { infer: true }),
      requestTimeoutMs: config.get("XENDIT_REQUEST_TIMEOUT_MS", {
        infer: true,
      }),
    };
  }

  public async createPaymentRequest(
    request: PaymentRequest,
  ): Promise<PaymentResponse> {
    const url = `${this.xenditConfig.baseUrl}/v2/invoices`;

    const response = await this.executeWithLogging(
      {
        operation: "createPaymentRequest",
        url,
        params: {
          bookingId: request.bookingId.value,
          amount: request.amount.amount + request.serviceFee.amount,
          currency: request.amount.currency,
        },
      },
      () =>
        this.fetchWithTimeout(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${Buffer.from(
              this.xenditConfig.apiKey + ":",
            ).toString("base64")}`,
          },
          body: JSON.stringify({
            external_id: request.bookingId.value,
            amount: request.amount.amount,
            currency: request.amount.currency,
            description: request.description,
            customer: {
              given_names: request.customerName,
              email: request.customerEmail.value,
            },
            success_redirect_url: request.successRedirectUrl,
            failure_redirect_url: request.failureRedirectUrl,
            invoice_duration: 900, // 15 minutes in seconds
          }),
        }),
    );

    if (!response.ok) {
      await this.handleErrorResponse(response, "createPaymentRequest", {
        bookingId: request.bookingId.value,
      });
    }

    try {
      const rawData = await response.json();
      const data: XenditInvoiceResponseDTO = validate(
        XenditInvoiceResponseDTOSchema,
        rawData,
      );

      this.logger.debug({
        event: "XENDIT_INVOICE_CREATED",
        invoiceId: data.id,
        externalId: data.external_id,
        status: data.status,
        invoiceUrl: data.invoice_url,
      });

      return {
        paymentReferenceId: data.id,
        paymentUrl: data.invoice_url,
        expiresAt: new Date(data.expiry_date),
      };
    } catch (error) {
      if (error instanceof ApplicationError) {
        throw new InfrastructureError({
          code: InfrastructureErrorCode.EXTERNAL_API_ERROR,
          message: `Xendit API returned invalid data for createPaymentRequest: ${error.message}`,
          details: error.details,
        });
      }

      throw error;
    }
  }

  public verifyWebhookSignature(
    payload: WebhookPayload,
    callbackToken: string,
  ): boolean {
    const requestId = randomUUID();
    const isValid = callbackToken === this.xenditConfig.webhookToken;

    this.logger.log({
      event: isValid
        ? "XENDIT_WEBHOOK_VERIFIED"
        : "XENDIT_WEBHOOK_VERIFICATION_FAILED",
      requestId,
      externalId: payload.external_id,
      status: payload.status,
      isValid,
      timestamp: new Date().toISOString(),
    });

    return isValid;
  }

  public parsePaymentResult(payload: WebhookPayload): PaymentResult {
    const requestId = randomUUID();

    this.logger.log({
      event: "XENDIT_WEBHOOK_PARSE",
      requestId,
      payloadId: payload.id,
      externalId: payload.external_id,
      status: payload.status,
      paymentMethod: payload.payment_method ?? "N/A",
      timestamp: new Date().toISOString(),
    });

    let status: PaymentStatus;

    switch (payload.status) {
      case "PAID":
      case "SETTLED":
        status = PaymentStatus.PAID;
        break;
      case "EXPIRED":
        status = PaymentStatus.EXPIRED;
        break;
      case "PENDING":
        status = PaymentStatus.PENDING;
        break;
      default:
        status = PaymentStatus.FAILED;
    }

    return {
      paymentReferenceId: payload.id,
      status,
      paymentMethod: payload.payment_method ?? null,
      paidAt: payload.paid_at ? new Date(payload.paid_at) : null,
    };
  }

  public async getPaymentStatus(
    paymentReferenceId: string,
  ): Promise<PaymentResult> {
    const url = `${this.xenditConfig.baseUrl}/v2/invoices/${paymentReferenceId}`;

    const response = await this.executeWithLogging(
      {
        operation: "getPaymentStatus",
        url,
        params: { paymentReferenceId },
      },
      () =>
        this.fetchWithTimeout(url, {
          method: "GET",
          headers: {
            Authorization: `Basic ${Buffer.from(
              this.xenditConfig.apiKey + ":",
            ).toString("base64")}`,
          },
        }),
    );

    if (!response.ok) {
      await this.handleErrorResponse(response, "getPaymentStatus", {
        paymentReferenceId,
      });
    }

    try {
      const rawData = await response.json();
      const data = validate(XenditInvoiceStatusResponseDTOSchema, rawData);

      this.logger.debug({
        event: "XENDIT_PAYMENT_STATUS_FETCHED",
        invoiceId: data.id,
        externalId: data.external_id,
        status: data.status,
        paymentMethod: data.payment_method,
        paidAt: data.paid_at,
      });

      return this.parsePaymentResult({
        id: data.id,
        external_id: data.external_id,
        status: data.status,
        payment_method: data.payment_method,
        paid_at: data.paid_at,
        amount: data.amount,
      });
    } catch (error) {
      if (error instanceof ApplicationError) {
        throw new InfrastructureError({
          code: InfrastructureErrorCode.EXTERNAL_API_ERROR,
          message: `Xendit API returned invalid data for getPaymentStatus: ${error.message}`,
          details: error.details,
        });
      }

      throw error;
    }
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.xenditConfig.requestTimeoutMs,
    );

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      return response;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new InfrastructureError({
          code: InfrastructureErrorCode.EXTERNAL_API_TIMEOUT,
          message: `Xendit API request timed out after ${this.xenditConfig.requestTimeoutMs}ms`,
        });
      }

      throw new InfrastructureError({
        code: InfrastructureErrorCode.EXTERNAL_API_ERROR,
        message: `Xendit API request failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        stack: error instanceof Error ? error.stack : undefined,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async handleErrorResponse(
    response: Response,
    operation: string,
    params: Record<string, unknown>,
  ): Promise<never> {
    let errorMessage = `Xendit API error during ${operation}`;
    let errorDetails: Record<string, unknown> = { ...params };

    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = `${errorMessage}: ${errorData.message}`;
      }
      if (errorData.error_code) {
        errorDetails.errorCode = errorData.error_code;
      }
      if (errorData.errors) {
        errorDetails.validationErrors = errorData.errors;
      }
    } catch {
      errorMessage = `${errorMessage}: HTTP ${response.status} ${response.statusText}`;
    }

    this.logger.error({
      event: "XENDIT_API_ERROR",
      operation,
      statusCode: response.status,
      statusText: response.statusText,
      errorMessage,
      errorDetails,
      timestamp: new Date().toISOString(),
    });

    throw new InfrastructureError({
      code: InfrastructureErrorCode.EXTERNAL_API_ERROR,
      message: errorMessage,
      details: errorDetails,
    });
  }

  private async executeWithLogging<T>(
    context: XenditRequestLogContext,
    apiCall: () => Promise<T>,
  ): Promise<T> {
    const requestId = randomUUID();
    const startTime = Date.now();

    this.logger.log({
      event: "XENDIT_REQUEST_START",
      requestId,
      operation: context.operation,
      url: context.url,
      params: context.params,
      timestamp: new Date().toISOString(),
    });

    try {
      const result = await apiCall();
      const duration = Date.now() - startTime;

      this.logger.log({
        event: "XENDIT_REQUEST_END",
        requestId,
        operation: context.operation,
        statusCode: (result as Response).status,
        statusText: (result as Response).statusText,
        duration: `${duration}ms`,
        success: (result as Response).ok,
        timestamp: new Date().toISOString(),
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error({
        event: "XENDIT_REQUEST_ERROR",
        requestId,
        operation: context.operation,
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
        errorType:
          error instanceof InfrastructureError ? error.code : "UNKNOWN",
        timestamp: new Date().toISOString(),
      });

      throw error;
    }
  }
}
