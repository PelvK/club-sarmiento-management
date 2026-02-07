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
  is_active: boolean;
  created_at: string;
  sport_supported?: Sport[];
  permissions?: UserPermissions;
}

export interface UserPermissions {
  can_add: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_view: boolean;
  can_manage_payments: boolean;
  can_generate_reports: boolean;
}

export interface CreateUserRequest {
  email: string;
  username: string;
  password: string;
  is_admin: boolean;
  is_active: boolean;
  sport_ids?: string[];
  permissions?: UserPermissions;
}

export interface UpdateUserRequest {
  email?: string;
  username?: string;
  password?: string;
  is_admin?: boolean;
  is_active?: boolean;
  sport_ids?: string[];
  permissions?: UserPermissions;
}