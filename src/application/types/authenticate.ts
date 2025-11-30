export interface AuthenticateCommand {
  emailAddress: string;
  plainPassword: string;
}

export interface AuthenticateResult {
  accessToken: string;
  refreshToken: string;
}
