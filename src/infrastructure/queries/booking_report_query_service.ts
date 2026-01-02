import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import {
  BookingReportFilters,
  CategoryStatsDTO,
  DateRange,
  EventRevenueDTO,
} from "./dtos/booking_report_dto";

@Injectable()
export class BookingReportQueryService {
  public constructor(private readonly dataSource: DataSource) {}

  public async getRevenueByEvent(dateRange: DateRange): Promise<EventRevenueDTO[]> {
    const results = await this.dataSource.query(
      `SELECT 
        e.id AS "eventId",
        e.title AS title,
        e.type AS type,
        COUNT(DISTINCT b.id) AS "totalBookings",
        COALESCE(SUM((ticket->'price'->>'amount')::numeric), 0) AS "totalRevenue",
        'IDR' AS currency
      FROM bookings b
      INNER JOIN showtimes s ON b.showtime_id = s.id
      INNER JOIN events e ON s.event_id = e.id
      CROSS JOIN LATERAL jsonb_array_elements(b.tickets) AS ticket
      WHERE b.status = $1
        AND b.confirmed_at >= $2
        AND b.confirmed_at <= $3
      GROUP BY e.id, e.title, e.type
      ORDER BY "totalRevenue" DESC`,
      ["CONFIRMED", dateRange.start, dateRange.end],
    );

    return results.map((row: Record<string, unknown>) => ({
      eventId: row.eventId as string,
      title: row.title as string,
      type: row.type as string,
      totalBookings: Number(row.totalBookings),
      totalRevenue: Number(row.totalRevenue),
      currency: (row.currency as string) || "IDR",
    }));
  }

  public async getBookingsByStatus(
    filters?: BookingReportFilters,
  ): Promise<{ status: string; count: number }[]> {
    const queryBuilder = this.dataSource
      .createQueryBuilder()
      .select(["b.status AS status", "COUNT(*) AS count"])
      .from("bookings", "b");

    if (filters?.dateRange) {
      queryBuilder
        .where("b.created_at >= :start", { start: filters.dateRange.start })
        .andWhere("b.created_at <= :end", { end: filters.dateRange.end });
    }

    if (filters?.eventId) {
      queryBuilder
        .innerJoin("showtimes", "s", "b.showtime_id = s.id")
        .andWhere("s.event_id = :eventId", { eventId: filters.eventId });
    }

    const results = await queryBuilder.groupBy("b.status").getRawMany();

    return results.map((row) => ({
      status: row.status,
      count: Number(row.count),
    }));
  }

  public async getCategoryHierarchy(): Promise<CategoryStatsDTO[]> {
    const results = await this.dataSource.query(`WITH RECURSIVE category_tree AS (
        SELECT id, name, parent_id, path, level, 0 AS depth
        FROM categories
        WHERE parent_id IS NULL
        UNION ALL
        SELECT c.id, c.name, c.parent_id, c.path, c.level, ct.depth + 1
        FROM categories c
        INNER JOIN category_tree ct ON c.parent_id = ct.id
      )
      SELECT * FROM category_tree
      ORDER BY path`);

    return results.map((row: Record<string, unknown>) => ({
      id: row.id as string,
      name: row.name as string,
      parentId: row.parent_id as string | null,
      path: row.path as string,
      level: Number(row.level),
      depth: Number(row.depth),
    }));
  }

  public async getDailyBookingTrends(
    dateRange: DateRange,
  ): Promise<{ date: string; count: number; revenue: number }[]> {
    const results = await this.dataSource.query(
      `SELECT 
        DATE(b.created_at) AS date,
        COUNT(DISTINCT b.id) AS count,
        COALESCE(SUM((ticket->'price'->>'amount')::numeric), 0) AS revenue
      FROM bookings b
      CROSS JOIN LATERAL jsonb_array_elements(b.tickets) AS ticket
      WHERE b.created_at >= $1
        AND b.created_at <= $2
      GROUP BY DATE(b.created_at)
      ORDER BY date ASC`,
      [dateRange.start, dateRange.end],
    );

    return results.map((row: Record<string, unknown>) => ({
      date: String(row.date),
      count: Number(row.count),
      revenue: Number(row.revenue),
    }));
  }
}
