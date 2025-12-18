import * as z from "zod";

export const XenditInvoiceResponseDTOSchema = z.object({
  id: z.string(),
  external_id: z.string(),
  status: z.string(),
  invoice_url: z.string().url(),
  expiry_date: z.string(),
  amount: z.number(),
  currency: z.string().optional(),
  created: z.string().optional(),
  updated: z.string().optional(),
  merchant_name: z.string().optional(),
  merchant_profile_picture_url: z.string().optional(),
  payer_email: z.string().optional(),
  description: z.string().optional(),
});

export type XenditInvoiceResponseDTO = z.infer<
  typeof XenditInvoiceResponseDTOSchema
>;

export const XenditInvoiceStatusResponseDTOSchema =
  XenditInvoiceResponseDTOSchema.extend({
    payment_method: z.string().optional(),
    payment_channel: z.string().optional(),
    payment_destination: z.string().optional(),
    paid_at: z.string().optional(),
    paid_amount: z.number().optional(),
  });

export type XenditInvoiceStatusResponseDTO = z.infer<
  typeof XenditInvoiceStatusResponseDTOSchema
>;

export const XenditWebhookPayloadDTOSchema = z.object({
  id: z.string(),
  external_id: z.string(),
  status: z.enum(["PENDING", "PAID", "SETTLED", "EXPIRED", "FAILED"]),
  amount: z.number(),
  currency: z.string().optional(),
  payment_method: z.string().optional(),
  payment_channel: z.string().optional(),
  paid_at: z.string().optional(),
  payer_email: z.string().optional(),
  created: z.string().optional(),
  updated: z.string().optional(),
});

export type XenditWebhookPayloadDTO = z.infer<
  typeof XenditWebhookPayloadDTOSchema
>;

export const XenditErrorResponseDTOSchema = z.object({
  error_code: z.string(),
  message: z.string(),
  errors: z
    .array(
      z.object({
        field: z.string().optional(),
        message: z.string().optional(),
      }),
    )
    .optional(),
});

export type XenditErrorResponseDTO = z.infer<
  typeof XenditErrorResponseDTOSchema
>;
