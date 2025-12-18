import { randomUUID } from "node:crypto";
import { ClassProps } from "src/shared/types/class_props";
import { StoragePath } from "./storage_path";

export class BookingInvoice {
  public readonly invoiceCode: string;
  public readonly invoiceStoragePath: StoragePath;
  public readonly generatedAt: Date;

  private constructor(props: ClassProps<BookingInvoice>) {
    this.invoiceCode = props.invoiceCode;
    this.invoiceStoragePath = props.invoiceStoragePath;
    this.generatedAt = props.generatedAt;
  }

  public static create(invoiceStoragePath: StoragePath): BookingInvoice {
    const invoiceCode = `INV-${randomUUID().substring(0, 8).toUpperCase()}`;
    return new BookingInvoice({
      invoiceCode,
      invoiceStoragePath,
      generatedAt: new Date(),
    });
  }

  public static fromPersistence(
    props: ClassProps<BookingInvoice>,
  ): BookingInvoice {
    return new BookingInvoice(props);
  }
}
