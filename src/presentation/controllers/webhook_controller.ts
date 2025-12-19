import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Post,
  UnauthorizedException,
} from "@nestjs/common";
import { BookingApplicationService } from "src/application/services/booking_application_service";
import {
  PaymentGateway,
  WebhookPayload,
} from "src/domain/ports/payment_gateway";
import { XenditWebhookBodyDTO } from "../dtos/booking_dto";
import { ConfigService } from "@nestjs/config";
import { AppConfig } from "src/infrastructure/configs/app_config";

@Controller("webhooks")
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  public constructor(
    @Inject(BookingApplicationService.name)
    private readonly bookingService: BookingApplicationService,
    @Inject(PaymentGateway.name)
    private readonly paymentGateway: PaymentGateway,
    @Inject(ConfigService)
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  @Post("xendit")
  @HttpCode(HttpStatus.OK)
  async handleXenditWebhook(
    @Headers("x-callback-token") callbackToken: string,
    @Body() body: XenditWebhookBodyDTO,
  ) {
    this.logger.log({
      event: "XENDIT_WEBHOOK_RECEIVED",
      externalId: body.external_id,
      status: body.status,
      amount: body.amount,
      paymentMethod: body.payment_method,
      timestamp: new Date().toISOString(),
    });

    const webhookToken = this.config.get("XENDIT_WEBHOOK_TOKEN", {
      infer: true,
    });

    if (
      !this.paymentGateway.verifyWebhookSignature(
        body as WebhookPayload,
        webhookToken,
      )
    ) {
      if (callbackToken !== webhookToken) {
        this.logger.warn({
          event: "XENDIT_WEBHOOK_INVALID_SIGNATURE",
          externalId: body.external_id,
          timestamp: new Date().toISOString(),
        });
        throw new UnauthorizedException("Invalid webhook signature");
      }
    }

    const paymentResult = this.paymentGateway.parsePaymentResult(
      body as WebhookPayload,
    );

    this.logger.log({
      event: "XENDIT_WEBHOOK_PROCESSING",
      paymentReferenceId: paymentResult.paymentReferenceId,
      status: paymentResult.status,
      paymentMethod: paymentResult.paymentMethod,
      paidAt: paymentResult.paidAt,
      timestamp: new Date().toISOString(),
    });

    await this.bookingService.handlePaymentCallback({
      paymentReferenceId: paymentResult.paymentReferenceId,
      status: paymentResult.status,
      paymentMethod: paymentResult.paymentMethod,
      paidAt: paymentResult.paidAt,
    });

    this.logger.log({
      event: "XENDIT_WEBHOOK_PROCESSED",
      externalId: body.external_id,
      status: body.status,
      timestamp: new Date().toISOString(),
    });

    return { received: true };
  }
}
