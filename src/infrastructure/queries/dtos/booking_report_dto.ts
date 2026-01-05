export interface EventRevenueDTO {
  eventId: string;
  title: string;
  type: string;
  totalBookings: number;
  totalRevenue: number;
  currency: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface CategoryStatsDTO {
  id: string;
  name: string;
  parentId: string | null;
  path: string;
  level: number;
  depth: number;
}

export interface BookingReportFilters {
  dateRange?: DateRange;
  eventId?: string;
  status?: string;
}
