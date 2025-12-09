export interface RegisterBodyDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginBodyDTO {
  email: string;
  password: string;
}
