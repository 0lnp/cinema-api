import { Column, Entity, ForeignKey, PrimaryColumn } from "typeorm";
import { UserORMEntity } from "./user_orm_entity";
import { ShowtimeORMEntity } from "./showtime_orm_entity";

export interface PaymentDetailsJSON {
  paymentReferenceId: string;
  paymentUrl: string;
  paymentMethod: string | null;
  paidAt: string | null;
}

export interface BookingTicketJSON {
  id: string;
  seatNumber: string;
  price: {
    amount: number;
    currency: string;
  };
  status: string;
  qrCode: {
    bucket: string;
    objectKey: string;
  } | null;
  ticketCode: string | null;
  issuedAt: string | null;
  usedAt: string | null;
}

export interface InvoiceJSON {
  invoiceCode: string;
  invoiceStoragePath: {
    bucket: string;
    objectKey: string;
  };
  generatedAt: string;
}

@Entity("bookings")
export class BookingORMEntity {
  @PrimaryColumn()
  public id!: string;
  @Column({ type: "varchar", name: "customer_id" })
  @ForeignKey(() => UserORMEntity, "id")
  public customerId!: string;
  @Column({ type: "varchar", name: "showtime_id" })
  @ForeignKey(() => ShowtimeORMEntity, "id")
  public showtimeId!: string;
  @Column({ type: "jsonb" })
  public tickets!: BookingTicketJSON[];
  @Column({ type: "varchar" })
  public status!: string;
  @Column({ type: "jsonb", name: "service_fee" })
  public serviceFee!: { amount: number; currency: string };
  @Column({ type: "jsonb", name: "payment_details", nullable: true })
  public paymentDetails!: PaymentDetailsJSON | null;
  @Column({ type: "jsonb", nullable: true })
  public invoice!: InvoiceJSON | null;
  @Column({ type: "varchar", name: "qr_code_hash", nullable: true })
  public qrCodeHash!: string | null;
  @Column({ type: "timestamp", name: "created_at" })
  public createdAt!: Date;
  @Column({ type: "timestamp", name: "hold_expires_at" })
  public holdExpiresAt!: Date;
  @Column({ type: "timestamp", name: "confirmed_at", nullable: true })
  public confirmedAt!: Date | null;
  @Column({ type: "timestamp", name: "cancelled_at", nullable: true })
  public cancelledAt!: Date | null;
  @Column({ type: "timestamp", name: "checked_in_at", nullable: true })
  public checkedInAt!: Date | null;
}
