import { BadRequestException, Controller, Get, Query, UseGuards } from "@nestjs/common";
import { BookingReportQueryService } from "src/infrastructure/queries/booking_report_query_service";
import { EventRevenueDTO } from "src/infrastructure/queries/dtos/booking_report_dto";
import { AuthGuard } from "../guards/auth_guard";
import { PermissionsGuard } from "../guards/permissions_guard";
import { Permissions } from "../decorators/permissions";
import {
  PermissionAction,
  PermissionResource,
} from "src/domain/value_objects/permission";

interface DateRangeParams {
  start_date: string;
  end_date: string;
}

interface BookingReportParams {
  start_date?: string;
  end_date?: string;
  event_id?: string;
  status?: string;
}

function parseDate(dateString: string | undefined, paramName: string): Date {
  if (!dateString) {
    throw new BadRequestException(`${paramName} is required`);
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new BadRequestException(`${paramName} is not a valid date format. Expected ISO 8601 format.`);
  }
  return date;
}

@Controller("reports")
@UseGuards(AuthGuard, PermissionsGuard)
@Permissions([PermissionAction.MANAGE, PermissionResource.BOOKING])
export class ReportController {
  public constructor(
    private readonly bookingReportService: BookingReportQueryService,
  ) {}

  @Get("revenue")
  public async getRevenueByEvent(@Query() query: DateRangeParams) {
    const startDate = parseDate(query.start_date, "start_date");
    const endDate = parseDate(query.end_date, "end_date");
    
    const results = await this.bookingReportService.getRevenueByEvent({
      start: startDate,
      end: endDate,
    });

    return {
      message: "Revenue report retrieved successfully",
      data: results.map((item: EventRevenueDTO) => ({
        event_id: item.eventId,
        title: item.title,
        type: item.type,
        total_bookings: item.totalBookings,
        total_revenue: item.totalRevenue,
        currency: item.currency,
      })),
    };
  }

  @Get("bookings")
  public async getBookingsByStatus(@Query() query: BookingReportParams) {
    const filters = {
      dateRange:
        query.start_date && query.end_date
          ? {
              start: new Date(query.start_date),
              end: new Date(query.end_date),
            }
          : undefined,
      eventId: query.event_id,
      status: query.status,
    };

    const results = await this.bookingReportService.getBookingsByStatus(filters);

    return {
      message: "Booking statistics retrieved successfully",
      data: results,
    };
  }

  @Get("daily-trend")
  public async getDailyBookingTrends(@Query() query: DateRangeParams) {
    const startDate = parseDate(query.start_date, "start_date");
    const endDate = parseDate(query.end_date, "end_date");
    
    const results = await this.bookingReportService.getDailyBookingTrends({
      start: startDate,
      end: endDate,
    });

    return {
      message: "Daily booking trends retrieved successfully",
      data: results,
    };
  }

  @Get("category-hierarchy")
  public async getCategoryHierarchy() {
    const results = await this.bookingReportService.getCategoryHierarchy();

    return {
      message: "Category hierarchy retrieved successfully",
      data: results,
    };
  }
}
