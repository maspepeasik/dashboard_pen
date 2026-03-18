export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "user";
  createdAt: string;
}

export interface AuthResponse {
  user: AuthUser;
}
