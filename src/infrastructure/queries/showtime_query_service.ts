import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

export interface ShowtimeQueryFilters {
  startDate?: Date;
  endDate?: Date;
  eventId?: string;
  screenId?: string;
  status?: string;
}

export interface ShowtimeDetailDTO {
  id: string;
  timeStart: Date;
  timeEnd: Date;
  pricing: { amount: number; currency: string };
  status: string;
  event: {
    id: string;
    type: string;
    title: string;
    durationMinutes: number;
    posterPath: string | null;
    certificate: string | null;
  };
  screen: {
    id: string;
    name: string;
    capacity: number;
  };
  bookedSeats: number;
  availableSeats: number;
}

@Injectable()
export class ShowtimeQueryService {
  constructor(private readonly dataSource: DataSource) {}

  async findShowtimesWithDetails(
    filters: ShowtimeQueryFilters,
  ): Promise<ShowtimeDetailDTO[]> {
    let query = this.dataSource
      .createQueryBuilder()
      .select([
        's.id AS id',
        's.time_start AS "timeStart"',
        's.time_end AS "timeEnd"',
        's.pricing AS pricing',
        's.status AS status',
        'e.id AS "eventId"',
        'e.type AS "eventType"',
        'e.title AS "eventTitle"',
        'e.duration_minutes AS "eventDurationMinutes"',
        'e.poster_path AS "eventPosterPath"',
        'e.certificate AS "eventCertificate"',
        'sc.id AS "screenId"',
        'sc.name AS "screenName"',
        'sc.capacity AS "screenCapacity"',
      ])
      .from("showtimes", "s")
      .innerJoin("events", "e", "s.event_id = e.id")
      .innerJoin("screens", "sc", "s.screen_id = sc.id")
      .where("s.deleted_at IS NULL");

    if (filters.startDate) {
      query = query.andWhere("s.time_start >= :startDate", {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      query = query.andWhere("s.time_start <= :endDate", {
        endDate: filters.endDate,
      });
    }

    if (filters.eventId) {
      query = query.andWhere("s.event_id = :eventId", {
        eventId: filters.eventId,
      });
    }

    if (filters.screenId) {
      query = query.andWhere("s.screen_id = :screenId", {
        screenId: filters.screenId,
      });
    }

    if (filters.status) {
      query = query.andWhere("s.status = :status", { status: filters.status });
    }

    query = query.orderBy("s.time_start", "ASC");

    const rawResults = await query.getRawMany();

    return rawResults.map((row) => ({
      id: row.id,
      timeStart: row.timeStart,
      timeEnd: row.timeEnd,
      pricing: typeof row.pricing === 'string' ? JSON.parse(row.pricing) : row.pricing,
      status: row.status,
      event: {
        id: row.eventId,
        type: row.eventType,
        title: row.eventTitle,
        durationMinutes: row.eventDurationMinutes,
        posterPath: row.eventPosterPath,
        certificate: row.eventCertificate,
      },
      screen: {
        id: row.screenId,
        name: row.screenName,
        capacity: row.screenCapacity,
      },
      bookedSeats: 0,
      availableSeats: row.screenCapacity,
    }));
  }

  async findUpcomingForEvent(eventId: string): Promise<ShowtimeDetailDTO[]> {
    return this.findShowtimesWithDetails({
      eventId,
      startDate: new Date(),
      status: "SCHEDULED",
    });
  }
}
