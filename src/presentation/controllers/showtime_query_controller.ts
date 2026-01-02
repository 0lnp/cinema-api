import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { ShowtimeQueryService, ShowtimeDetailDTO } from "src/infrastructure/queries/showtime_query_service";
import { AuthGuard } from "../guards/auth_guard";

interface ShowtimeQueryParams {
  start_date?: string;
  end_date?: string;
  event_id?: string;
  screen_id?: string;
  status?: string;
}

@Controller("showtimes")
export class ShowtimeQueryController {
  public constructor(
    private readonly showtimeQueryService: ShowtimeQueryService,
  ) {}

  @UseGuards(AuthGuard)
  @Get("details")
  public async getShowtimesWithDetails(@Query() query: ShowtimeQueryParams) {
    const filters = {
      startDate: query.start_date ? new Date(query.start_date) : undefined,
      endDate: query.end_date ? new Date(query.end_date) : undefined,
      eventId: query.event_id,
      screenId: query.screen_id,
      status: query.status,
    };

    const results =
      await this.showtimeQueryService.findShowtimesWithDetails(filters);

    return {
      message: "Showtimes with details retrieved successfully",
      data: results.map((item: ShowtimeDetailDTO) => ({
        id: item.id,
        time_start: item.timeStart,
        time_end: item.timeEnd,
        pricing: item.pricing,
        status: item.status,
        event: {
          id: item.event.id,
          type: item.event.type,
          title: item.event.title,
          duration_minutes: item.event.durationMinutes,
          poster_path: item.event.posterPath,
          certificate: item.event.certificate,
        },
        screen: {
          id: item.screen.id,
          name: item.screen.name,
          capacity: item.screen.capacity,
        },
        booked_seats: item.bookedSeats,
        available_seats: item.availableSeats,
      })),
    };
  }

  @UseGuards(AuthGuard)
  @Get("events/:eventId/upcoming")
  public async getUpcomingForEvent(@Param("eventId") eventId: string) {
    const results =
      await this.showtimeQueryService.findUpcomingForEvent(eventId);

    return {
      message: "Upcoming showtimes retrieved successfully",
      data: results.map((item: ShowtimeDetailDTO) => ({
        id: item.id,
        time_start: item.timeStart,
        time_end: item.timeEnd,
        pricing: item.pricing,
        status: item.status,
        screen: {
          id: item.screen.id,
          name: item.screen.name,
          capacity: item.screen.capacity,
        },
        booked_seats: item.bookedSeats,
        available_seats: item.availableSeats,
      })),
    };
  }
}
