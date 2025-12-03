export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResult {
  userID: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
}
