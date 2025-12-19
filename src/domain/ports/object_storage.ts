import { StoragePath } from "../value_objects/storage_path";
import { TicketDownloadLink } from "../value_objects/ticket_download_link";

export abstract class ObjectStorage {
  public abstract upload(
    bucket: string,
    key: string,
    content: Buffer,
    contentType: string,
  ): Promise<StoragePath>;

  public abstract download(path: StoragePath): Promise<Buffer>;

  public abstract generatePresignedDownloadUrl(
    path: StoragePath,
    expirationSeconds: number,
  ): Promise<TicketDownloadLink>;

  public abstract delete(path: StoragePath): Promise<void>;
}
