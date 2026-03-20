import { Sport } from "../../../lib/types/sport";
import { User } from "../../../lib/types/auth";

export interface GenerationHistoryFilterValues {
  sport: string;
  createdBy: string;
}

export interface GenerationHistoryFilterProps {
  filters: GenerationHistoryFilterValues;
  onFilterChange: (key: keyof GenerationHistoryFilterValues, value: string) => void;
  onClearFilters: () => void;
  sports: Sport[];
  users: User[];
  hasActiveFilters: boolean;
  resultCount?: number;
}
