import { Sport } from "../../../lib/types/sport";

export interface UsersFilterState {
  username?: string;
  email?: string;
  role?: string;
  status?: string;
  sport?: string;
}

export interface UsersFilterProps {
  filters: UsersFilterState;
  onFilterChange: (key: keyof UsersFilterState, value: string) => void;
  sports: Sport[];
}
