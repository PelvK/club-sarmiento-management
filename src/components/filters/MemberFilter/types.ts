import { Sport } from "../../../lib/types/sport";

export type FiltersType = {
  name: string;
  second_name: string;
  dni: string;
  sport: string;
};

export interface MemberFilterProps {
  filters: FiltersType;
  onFilterChange: (name: keyof FiltersType, value: string) => void;
  sports: Sport[] | null;
}
