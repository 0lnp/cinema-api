import { Module } from "@nestjs/common";
import { ShowtimeQueryService } from "../queries/showtime_query_service";
import { BookingReportQueryService } from "../queries/booking_report_query_service";

@Module({
  providers: [ShowtimeQueryService, BookingReportQueryService],
  exports: [ShowtimeQueryService, BookingReportQueryService],
})
export class QueryModule {}
