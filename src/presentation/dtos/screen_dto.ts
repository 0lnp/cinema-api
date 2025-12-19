export interface PostScreensBodyDTO {
  name: string;
  rows: Array<{
    label: string;
    seat_count: number;
  }>;
}

export interface PatchScreenIDParamsDTO {
  screen_id: string;
}

export interface PatchScreenIDBodyDTO {
  rows: Array<{
    label: string;
    seat_count: number;
  }>;
}

export interface DeleteScreenParamsDTO {
  screen_id: string;
}
