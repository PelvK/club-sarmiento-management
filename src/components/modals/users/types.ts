import { User, CreateUserRequest, UpdateUserRequest } from "../../../lib/types/auth";

export interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: CreateUserRequest) => Promise<void>;
}

export interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, userData: UpdateUserRequest) => Promise<void>;
  user: User | null;
}

export interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}
