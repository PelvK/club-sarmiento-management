import { Filter, UserCheck, UserPlus, Users } from "lucide-react";
import React from "react";
import { Member } from "../../lib/types/member";
import { Quote } from "../../lib/types/quote";

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
  primaryMembers,
  secondaryMembers,
  quotes,
  selectedQuote,
  handleQuoteChange,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6 w-full mt-6">
      <div className="flex items-center mb-4">
        <Filter className="w-5 h-5 text-gray-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Filtros de búsqueda</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre o apellido
          </label>
          <div className="relative">
            <input
              type="text"
              id="name"
              value={filters.name?.toString()}
              onChange={(e) => onFilterChange("name", e.target.value)}
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition-colors"
              placeholder="Buscar por nombre..."
            />
          </div>
        </div>

        <div>
          <label htmlFor="dni" className="block text-sm font-medium text-gray-700 mb-2">
            DNI
          </label>
          <div className="relative">
            <input
              type="text"
              id="dni"
              value={filters.dni?.toString()}
              onChange={(e) => onFilterChange("dni", e.target.value)}
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition-colors"
              placeholder="Buscar por DNI..."
            />
          </div>
        </div>

        <div>
          <label htmlFor="quote" className="block text-sm font-medium text-gray-700 mb-2">
            Cuota
          </label>
          <select
            id="quote"
            value={selectedQuote?.name || "All"}
            onChange={handleQuoteChange}
            className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition-colors bg-white"
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

      <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
        <span className="text-sm font-medium text-gray-700 mr-2">Tipo de disciplina:</span>
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
      </div>
    </div>
  );
};
