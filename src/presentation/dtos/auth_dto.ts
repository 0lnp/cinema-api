export interface RegisterBodyDTO {
  display_name: string;
  email: string;
  password: string;
}

export interface LoginBodyDTO {
  email: string;
  password: string;
}

export interface RefreshBodyDTO {
  refresh_token: string;
}
