export interface BaseSuccessfulResponse<T> {
  message: string;
  data: T;
}
