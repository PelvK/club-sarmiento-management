import { Filter, UserCheck, UserPlus, Users } from "lucide-react";
import React from "react";
import { Member, Quote } from "../../types";

interface FiltersProps {
  filters: {
    name: string;
    second_name: string;
    dni: string;
  };
  onFilterChange: (name: string, value: string) => void;
  onMemberTypeChange: (type: "all" | "primary" | "secondary") => void;
  getFilterButtonClass: (type: "all" | "primary" | "secondary") => string;
  members: Member[];
  primaryMembers: Member[];
  secondaryMembers: Member[];
  quotes: Quote[] | undefined;
  selectedQuote: Quote | null;
  handleQuoteChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const SportDetailFilters: React.FC<FiltersProps> = ({
  filters,
  onFilterChange,
  onMemberTypeChange,
  getFilterButtonClass,
  members,
  primaryMembers,
  secondaryMembers,
  quotes,
  selectedQuote,
  handleQuoteChange,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6 w-full">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Nombre */}
        <div className="md:col-span-1">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nombre o apellido
          </label>
          <input
            type="text"
            id="name"
            value={filters.name?.toString()}
            onChange={(e) => onFilterChange("name", e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
            placeholder="Buscar por nombre..."
          />
        </div>

        {/* DNI */}
        <div className="md:col-span-1">
          <label
            htmlFor="dni"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            DNI
          </label>
          <input
            type="text"
            id="dni"
            value={filters.dni?.toString()}
            onChange={(e) => onFilterChange("dni", e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
            placeholder="Buscar por DNI..."
          />
        </div>

        {/* Filtros + cuotas */}
        <div className="md:col-span-2 flex items-center flex-wrap gap-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <button
            onClick={() => onMemberTypeChange("all")}
            className={getFilterButtonClass("all")}
          >
            <Users className="h-4 w-4 mr-1" />
            Todos ({primaryMembers.length + secondaryMembers.length})
          </button>
          <button
            onClick={() => onMemberTypeChange("primary")}
            className={getFilterButtonClass("primary")}
          >
            <UserCheck className="h-4 w-4 mr-1" />
            Principal ({primaryMembers.length})
          </button>
          <button
            onClick={() => onMemberTypeChange("secondary")}
            className={getFilterButtonClass("secondary")}
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Secundaria ({secondaryMembers.length})
          </button>

          <select
            id="quote"
            value={selectedQuote?.name || "All"}
            onChange={handleQuoteChange}
            className="block h-9 rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50 flex-1 min-w-[150px] text-sm"
          >
            <option value="All">Todas las cuotas</option>
            {quotes?.map((quote) => (
              <option key={quote.id} value={quote.name}>
                {quote.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
