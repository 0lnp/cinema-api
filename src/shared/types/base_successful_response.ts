export interface BaseSuccessfulResponse<T> {
  status_code?: number;
  message: string;
  data: T;
}
