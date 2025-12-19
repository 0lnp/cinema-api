import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { BookingApplicationService } from "src/application/services/booking_application_service";
import { AuthGuard } from "../guards/auth_guard";
import { PermissionsGuard } from "../guards/permissions_guard";
import { Permissions } from "../decorators/permissions";
import {
  PermissionAction,
  PermissionResource,
} from "src/domain/value_objects/permission";
import { type Request as TRequest } from "express";
import {
  GetBookingParamsDTO,
  GetBookingsQueryDTO,
  GetTicketDownloadParamsDTO,
  GetTicketDownloadQueryDTO,
  PostBookingBodyDTO,
  PostBookingCancelParamsDTO,
  PostBookingPaymentParamsDTO,
} from "../dtos/booking_dto";
import { BookingMapper } from "../mappers/booking_mapper";
import { ParsePaginatedQueryPipe } from "../pipes/parse_paginated_query_pipe";
import { BookingSortField } from "src/domain/repositories/booking_repository";
import { PaginatedQuery } from "src/shared/types/pagination";

@Controller("bookings")
export class BookingController {
  public constructor(
    @Inject(BookingApplicationService.name)
    private readonly bookingService: BookingApplicationService,
  ) {}

  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(
    [PermissionAction.CREATE, PermissionResource.BOOKING],
    [PermissionAction.MANAGE, PermissionResource.BOOKING],
  )
  @Post()
  async createBooking(
    @Request() req: TRequest,
    @Body() body: PostBookingBodyDTO,
  ) {
    const dto = BookingMapper.toCreateRequest(body);
    const result = await this.bookingService.createBooking({
      ...dto,
      customerId: req.user.id,
    });
    return BookingMapper.toCreateResponse(result);
  }

  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(
    [PermissionAction.VIEW, PermissionResource.BOOKING],
    [PermissionAction.VIEW_ALL, PermissionResource.BOOKING],
    [PermissionAction.MANAGE, PermissionResource.BOOKING],
  )
  @Get(":booking_id")
  async getBooking(@Param() params: GetBookingParamsDTO) {
    const dto = BookingMapper.toGetRequest(params);
    const result = await this.bookingService.getBooking(dto);
    return BookingMapper.toGetResponse(result);
  }

  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(
    [PermissionAction.VIEW, PermissionResource.BOOKING],
    [PermissionAction.MANAGE, PermissionResource.BOOKING],
  )
  @Get()
  @UsePipes(
    new ParsePaginatedQueryPipe<BookingSortField>([
      "createdAt",
      "holdExpiresAt",
      "status",
    ]),
  )
  async getUserBookings(@Request() req: TRequest, @Query() query: any) {
    const paginatedQuery = query as PaginatedQuery<BookingSortField>;
    const result = await this.bookingService.getUserBookings({
      userId: req.user.id,
      query: paginatedQuery,
    });
    return BookingMapper.toGetAllResponse(result);
  }

  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(
    [PermissionAction.VIEW_ALL, PermissionResource.BOOKING],
    [PermissionAction.MANAGE, PermissionResource.BOOKING],
  )
  @Get("admin/all")
  @UsePipes(
    new ParsePaginatedQueryPipe<BookingSortField>([
      "createdAt",
      "holdExpiresAt",
      "status",
    ]),
  )
  async getAllBookings(@Query() query: any) {
    const { user_id, showtime_id, status, ...paginatedQuery } =
      query as PaginatedQuery<BookingSortField> & GetBookingsQueryDTO;
    const result = await this.bookingService.getAllBookings({
      query: paginatedQuery,
      filters: {
        customerId: user_id,
        showtimeId: showtime_id,
        status,
      },
    });
    return BookingMapper.toGetAllResponse(result);
  }

  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(
    [PermissionAction.CREATE, PermissionResource.BOOKING],
    [PermissionAction.MANAGE, PermissionResource.BOOKING],
  )
  @Post(":booking_id/pay")
  async initiatePayment(
    @Request() req: TRequest,
    @Param() params: PostBookingPaymentParamsDTO,
  ) {
    const dto = BookingMapper.toInitiatePaymentRequest(params);
    const result = await this.bookingService.initiatePayment({
      ...dto,
      customerId: req.user.id,
    });
    return BookingMapper.toInitiatePaymentResponse(result);
  }

  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(
    [PermissionAction.CREATE, PermissionResource.BOOKING],
    [PermissionAction.MANAGE, PermissionResource.BOOKING],
  )
  @Post(":booking_id/cancel")
  async cancelBooking(
    @Request() req: TRequest,
    @Param() params: PostBookingCancelParamsDTO,
  ) {
    const dto = BookingMapper.toCancelRequest(params);
    const result = await this.bookingService.cancelBooking({
      ...dto,
      customerId: req.user.id,
    });
    return BookingMapper.toCancelResponse(result);
  }

  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(
    [PermissionAction.VIEW, PermissionResource.BOOKING],
    [PermissionAction.MANAGE, PermissionResource.BOOKING],
  )
  @Get(":booking_id/ticket/download")
  async getTicketDownload(
    @Request() req: TRequest,
    @Param() params: GetTicketDownloadParamsDTO,
    @Query() query: GetTicketDownloadQueryDTO,
  ) {
    const dto = BookingMapper.toTicketDownloadRequest(params, query);
    const result = await this.bookingService.getTicketDownloadLink({
      ...dto,
      customerId: req.user.id,
    });
    return BookingMapper.toTicketDownloadResponse(result);
  }
}
