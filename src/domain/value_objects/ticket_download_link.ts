import { ClassProps } from "src/shared/types/class_props";

export class TicketDownloadLink {
  public readonly url: string;
  public readonly expiresAt: Date;

  private constructor(props: ClassProps<TicketDownloadLink>) {
    this.url = props.url;
    this.expiresAt = props.expiresAt;
  }

  public static create(url: string, expiresAt: Date): TicketDownloadLink {
    if (!url || url.trim().length === 0) {
      throw new Error("URL cannot be empty");
    }
    if (expiresAt.getTime() <= Date.now()) {
      throw new Error("Expiration time must be in the future");
    }
    return new TicketDownloadLink({ url, expiresAt });
  }

  public isExpired(): boolean {
    return new Date() > this.expiresAt;
  }
}
