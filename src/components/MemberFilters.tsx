import React from 'react';
import { Sport } from '../types';

interface MemberFiltersProps {
  filters: {
    name: string;
    second_name: string
    dni: string;
    sport: string;
  };
  onFilterChange: (name: string, value: string) => void;
  sports: Sport[] | null;
}

export const MemberFilters: React.FC<MemberFiltersProps> = ({
  filters,
  onFilterChange,
  sports
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre o apellido
          </label>
          <div className="relative">
            <input
              type="text"
              id="name"
              value={filters.name?.toString()}
              onChange={(e) => onFilterChange('name', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
              placeholder="Buscar por nombre..."
            />
          </div>
        </div>

        <div>
          <label htmlFor="dni" className="block text-sm font-medium text-gray-700 mb-1">
            DNI
          </label>
          <input
            type="text"
            id="dni"
            value={filters.dni?.toString()}
            onChange={(e) => onFilterChange('dni', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
            placeholder="Buscar por DNI..."
          />
        </div>

        <div>
          <label htmlFor="sport" className="block text-sm font-medium text-gray-700 mb-1">
            Discplina
          </label>
          <select
            id="sport"
            value={filters.sport?.toString()}
            onChange={(e) => onFilterChange('sport', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
          >
            <option value="All">Todas las disciplinas</option>
            <option value="None">Ninguna</option>
            {sports && sports?.map((sport) => (
              <option key={sport.id} value={sport.name}>
                {sport.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};