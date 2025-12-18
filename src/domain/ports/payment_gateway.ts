import { Money } from "../value_objects/money";
import { Email } from "../value_objects/email";
import { BookingID } from "../value_objects/booking_id";

export interface PaymentRequest {
  bookingId: BookingID;
  amount: Money;
  serviceFee: Money;
  customerEmail: Email;
  customerName: string;
  description: string;
  successRedirectUrl: string;
  failureRedirectUrl: string;
}

export interface PaymentResponse {
  paymentReferenceId: string;
  paymentUrl: string;
  expiresAt: Date;
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  EXPIRED = "EXPIRED",
  FAILED = "FAILED",
}

export interface PaymentResult {
  paymentReferenceId: string;
  status: PaymentStatus;
  paymentMethod: string | null;
  paidAt: Date | null;
}

export interface WebhookPayload {
  id: string;
  external_id: string;
  status: string;
  payment_method?: string;
  paid_at?: string;
  amount: number;
  [key: string]: unknown;
}

export abstract class PaymentGateway {
  public abstract createPaymentRequest(
    request: PaymentRequest,
  ): Promise<PaymentResponse>;
  public abstract verifyWebhookSignature(
    payload: WebhookPayload,
    callbackToken: string,
  ): boolean;
  public abstract parsePaymentResult(payload: WebhookPayload): PaymentResult;
  public abstract getPaymentStatus(
    paymentReferenceId: string,
  ): Promise<PaymentResult>;
}
