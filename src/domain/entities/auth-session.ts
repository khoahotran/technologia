export interface AuthSessionUser {
  userId: string;
  username: string;
  email: string;
  role: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: AuthSessionUser;
}
