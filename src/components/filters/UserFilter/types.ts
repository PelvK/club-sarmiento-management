import { Sport } from "../../../lib/types/sport";

export type UsersFiltersType = {
  username?: string;
  email?: string;
  role?: string;
  status?: string;
  sport?: string;
};

export type UsersFilterProps = {
  filters: UsersFiltersType;
  onFilterChange: (name: keyof UsersFiltersType, value: string) => void;
  onClearFilters?: () => void;
  sports: Sport[];
  hasActiveFilters?: boolean;
  resultCount?: number;
};