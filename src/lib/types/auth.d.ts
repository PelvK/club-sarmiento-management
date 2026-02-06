import { Sport } from "./sport";

export interface AuthResponse {
  user: User;
  session: Session;
}

export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  is_admin: boolean;
  created_at: string;
  sport_supported?: Sport[];
}