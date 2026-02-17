import { Sport } from "../../../lib/types/sport";

export type FiltersType = {
  name: string;
  second_name: string;
  dni: string;
  sport: string;
};

export type MemberFilterProps = {
  filters: FiltersType;
  onFilterChange: (name: keyof FiltersType, value: string) => void;
  onClearFilters?: () => void;
  sports: Sport[] | null;
  hasActiveFilters?: boolean;
  resultCount?: number;
};