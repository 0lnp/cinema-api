import { InjectRepository } from "@nestjs/typeorm";
import {
  FindOptionsOrder,
  FindOptionsWhere,
  LessThan,
  Repository,
} from "typeorm";
import {
  BookingRepository,
  BookingSearchFilters,
  BookingSortField,
} from "src/domain/repositories/booking_repository";
import { Booking } from "src/domain/aggregates/booking";
import { BookingID } from "src/domain/value_objects/booking_id";
import { UserID } from "src/domain/value_objects/user_id";
import { ShowtimeID } from "src/domain/value_objects/showtime_id";
import { BookingStatus } from "src/domain/value_objects/booking_status";
import { Money, CurrencyCode } from "src/domain/value_objects/money";
import { PaymentDetails } from "src/domain/value_objects/payment_details";
import { BookingInvoice } from "src/domain/value_objects/ticket";
import { BookingTicket } from "src/domain/entities/booking_ticket";
import { TicketStatus } from "src/domain/value_objects/ticket_status";
import { StoragePath } from "src/domain/value_objects/storage_path";
import {
  BookingORMEntity,
  PaymentDetailsJSON,
  BookingTicketJSON,
  InvoiceJSON,
} from "../databases/orm_entities/booking_orm_entity";
import {
  InfrastructureError,
  InfrastructureErrorCode,
} from "src/shared/exceptions/infrastructure_error";
import { PaginatedQuery, PaginatedResult } from "src/shared/types/pagination";

export class TypeormBookingRepository implements BookingRepository {
  public constructor(
    @InjectRepository(BookingORMEntity)
    private readonly ormRepository: Repository<BookingORMEntity>,
  ) {}

  public async bookingOfID(id: BookingID): Promise<Booking | null> {
    const entity = await this.ormRepository.findOneBy({ id: id.value });
    return entity !== null ? this.toDomain(entity) : null;
  }

  public async bookingOfPaymentReferenceId(
    paymentReferenceId: string,
  ): Promise<Booking | null> {
    const entity = await this.ormRepository
      .createQueryBuilder("booking")
      .where(
        "booking.payment_details->>'paymentReferenceId' = :paymentReferenceId",
        { paymentReferenceId },
      )
      .getOne();

    return entity !== null ? this.toDomain(entity) : null;
  }

  public async bookingsOfUser(
    userId: UserID,
    query: PaginatedQuery<BookingSortField>,
  ): Promise<PaginatedResult<Booking>> {
    const { page, limit, sort } = query;
    const skip = (page - 1) * limit;

    const order: FindOptionsOrder<BookingORMEntity> = {};
    if (sort) {
      order[sort.field] = sort.order.toUpperCase() as "ASC" | "DESC";
    } else {
      order.createdAt = "DESC";
    }

    const [entities, total] = await this.ormRepository.findAndCount({
      where: { customerId: userId.value },
      order,
      skip,
      take: limit,
    });

    return {
      items: entities.map((entity) => this.toDomain(entity)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  public async bookingsOfShowtime(showtimeId: ShowtimeID): Promise<Booking[]> {
    const entities = await this.ormRepository.find({
      where: { showtimeId: showtimeId.value },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  public async pendingExpiredBefore(timestamp: Date): Promise<Booking[]> {
    const entities = await this.ormRepository.find({
      where: {
        status: BookingStatus.PENDING_PAYMENT,
        holdExpiresAt: LessThan(timestamp),
      },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  public async allBookings(
    query: PaginatedQuery<BookingSortField>,
    filters?: BookingSearchFilters,
  ): Promise<PaginatedResult<Booking>> {
    const { page, limit, sort } = query;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<BookingORMEntity> = {};

    if (filters?.userId) {
      where.customerId = filters.userId.value;
    }
    if (filters?.showtimeId) {
      where.showtimeId = filters.showtimeId.value;
    }
    if (filters?.status) {
      where.status = filters.status;
    }

    const order: FindOptionsOrder<BookingORMEntity> = {};
    if (sort) {
      order[sort.field] = sort.order.toUpperCase() as "ASC" | "DESC";
    } else {
      order.createdAt = "DESC";
    }

    const [entities, total] = await this.ormRepository.findAndCount({
      where,
      order,
      skip,
      take: limit,
    });

    return {
      items: entities.map((entity) => this.toDomain(entity)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  public async nextIdentity(): Promise<BookingID> {
    const maxAttempts = 3;
    let attempt = 0;

    while (attempt < maxAttempts) {
      const id = BookingID.generate();
      const exists = await this.ormRepository.existsBy({ id: id.value });

      if (!exists) {
        return id;
      }

      attempt++;
    }

    throw new InfrastructureError({
      code: InfrastructureErrorCode.ID_GENERATION_FAILED,
      message: `Failed to generate unique BookingID after ${maxAttempts} attempts`,
    });
  }

  public async save(booking: Booking): Promise<void> {
    const entity = this.toPersistence(booking);
    await this.ormRepository.save(entity);
  }

  private toDomain(entity: BookingORMEntity): Booking {
    const tickets: BookingTicket[] = entity.tickets.map((ticketJson) => {
      let qrCode: StoragePath | null = null;
      if (ticketJson.qrCode !== null) {
        qrCode = StoragePath.fromPersistence({
          bucket: ticketJson.qrCode.bucket,
          objectKey: ticketJson.qrCode.objectKey,
        });
      }

      return new BookingTicket({
        id: ticketJson.id,
        seatNumber: ticketJson.seatNumber,
        price: Money.create(
          ticketJson.price.amount,
          ticketJson.price.currency as CurrencyCode,
        ),
        status: ticketJson.status as TicketStatus,
        qrCode,
        ticketCode: ticketJson.ticketCode,
        issuedAt:
          ticketJson.issuedAt !== null ? new Date(ticketJson.issuedAt) : null,
        usedAt: ticketJson.usedAt !== null ? new Date(ticketJson.usedAt) : null,
      });
    });

    let paymentDetails: PaymentDetails | null = null;
    if (entity.paymentDetails !== null) {
      paymentDetails = PaymentDetails.fromPersistence({
        paymentReferenceId: entity.paymentDetails.paymentReferenceId,
        paymentUrl: entity.paymentDetails.paymentUrl,
        paymentMethod: entity.paymentDetails.paymentMethod,
        paidAt: entity.paymentDetails.paidAt
          ? new Date(entity.paymentDetails.paidAt)
          : null,
      });
    }

    let invoice: BookingInvoice | null = null;
    if (entity.invoice !== null) {
      invoice = BookingInvoice.fromPersistence({
        invoiceCode: entity.invoice.invoiceCode,
        invoiceStoragePath: StoragePath.fromPersistence({
          bucket: entity.invoice.invoiceStoragePath.bucket,
          objectKey: entity.invoice.invoiceStoragePath.objectKey,
        }),
        generatedAt: new Date(entity.invoice.generatedAt),
      });
    }

    return new Booking({
      id: new BookingID(entity.id),
      customerId: new UserID(entity.customerId),
      showtimeId: new ShowtimeID(entity.showtimeId),
      tickets,
      status: entity.status as BookingStatus,
      serviceFee: Money.create(
        entity.serviceFee.amount,
        entity.serviceFee.currency as CurrencyCode,
      ),
      paymentDetails,
      invoice,
      qrCodeHash: entity.qrCodeHash,
      createdAt: entity.createdAt,
      holdExpiresAt: entity.holdExpiresAt,
      confirmedAt: entity.confirmedAt,
      cancelledAt: entity.cancelledAt,
      checkedInAt: entity.checkedInAt,
    });
  }

  private toPersistence(booking: Booking): BookingORMEntity {
    const tickets: BookingTicketJSON[] = booking.tickets.map((ticket) => ({
      id: ticket.id,
      seatNumber: ticket.seatNumber,
      price: {
        amount: ticket.price.amount,
        currency: ticket.price.currency,
      },
      status: ticket.status,
      qrCode:
        ticket.qrCode !== null
          ? {
              bucket: ticket.qrCode.bucket,
              objectKey: ticket.qrCode.objectKey,
            }
          : null,
      ticketCode: ticket.ticketCode,
      issuedAt: ticket.issuedAt?.toISOString() ?? null,
      usedAt: ticket.usedAt?.toISOString() ?? null,
    }));

    let paymentDetails: PaymentDetailsJSON | null = null;
    if (booking.paymentDetails !== null) {
      paymentDetails = {
        paymentReferenceId: booking.paymentDetails.paymentReferenceId,
        paymentUrl: booking.paymentDetails.paymentUrl,
        paymentMethod: booking.paymentDetails.paymentMethod,
        paidAt: booking.paymentDetails.paidAt?.toISOString() ?? null,
      };
    }

    let invoice: InvoiceJSON | null = null;
    if (booking.invoice !== null) {
      invoice = {
        invoiceCode: booking.invoice.invoiceCode,
        invoiceStoragePath: {
          bucket: booking.invoice.invoiceStoragePath.bucket,
          objectKey: booking.invoice.invoiceStoragePath.objectKey,
        },
        generatedAt: booking.invoice.generatedAt.toISOString(),
      };
    }

    return {
      id: booking.id.value,
      customerId: booking.customerId.value,
      showtimeId: booking.showtimeId.value,
      tickets,
      status: booking.status,
      serviceFee: {
        amount: booking.serviceFee.amount,
        currency: booking.serviceFee.currency,
      },
      paymentDetails,
      invoice,
      qrCodeHash: booking.qrCodeHash,
      createdAt: booking.createdAt,
      holdExpiresAt: booking.holdExpiresAt,
      confirmedAt: booking.confirmedAt,
      cancelledAt: booking.cancelledAt,
      checkedInAt: booking.checkedInAt,
    };
  }
}
