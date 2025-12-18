import * as z from "zod";

export const SmtpSendMailResponseDTOSchema = z.object({
  messageId: z.string(),
  accepted: z.array(z.string()),
  rejected: z.array(z.string()),
  pending: z.array(z.string()).optional(),
  response: z.string(),
  envelope: z.object({
    from: z.string(),
    to: z.array(z.string()),
  }),
});

export type SmtpSendMailResponseDTO = z.infer<
  typeof SmtpSendMailResponseDTOSchema
>;
