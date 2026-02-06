import React from "react";
import { Search } from "lucide-react";
interface SportFiltersProps {
  filters: {
    name: string;
  };
  onFilterChange: (name: string, value: string) => void;
}

export const SportFilters: React.FC<SportFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  return (
    <div className="bg-white p-3 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <div className="flex items-center space-x-4">
          <Search className="w-5 h-5 mr-2" />
          <input
            type="text"
            id="name"
            value={filters.name?.toString()}
            onChange={(e) => onFilterChange("name", e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
            placeholder="Buscar por nombre..."
          />
        </div>
      </div>
    </div>
  );
};
