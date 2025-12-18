import * as z from "zod";

export const MinioUploadResultDTOSchema = z.object({
  etag: z.string(),
  versionId: z.string().nullable().optional(),
});

export type MinioUploadResultDTO = z.infer<typeof MinioUploadResultDTOSchema>;

export const MinioBucketExistsResultDTOSchema = z.boolean();

export type MinioBucketExistsResultDTO = z.infer<
  typeof MinioBucketExistsResultDTOSchema
>;

export const MinioPresignedUrlResultDTOSchema = z.string().url();

export type MinioPresignedUrlResultDTO = z.infer<
  typeof MinioPresignedUrlResultDTOSchema
>;
