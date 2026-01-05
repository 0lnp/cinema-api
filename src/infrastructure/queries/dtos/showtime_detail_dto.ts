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

export interface ShowtimeQueryFilters {
  startDate?: Date;
  endDate?: Date;
  eventId?: string;
  screenId?: string;
  status?: string;
}
