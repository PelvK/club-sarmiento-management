import React from 'react';
import { Search, Calendar, Filter } from 'lucide-react';
import type { PaymentFilter, Sport, Member } from '../../types';

interface PaymentFiltersProps {
  filters: PaymentFilter;
  onFilterChange: (name: keyof PaymentFilter, value: string) => void;
  sports: Sport[];
  members: Member[];
}

export const PaymentFilters: React.FC<PaymentFiltersProps> = ({
  filters,
  onFilterChange,
  sports,
  members
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="flex items-center mb-4">
        <Filter className="h-5 w-5 text-[#FFD700] mr-2" />
        <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Member Filter */}
        <div>
          <label htmlFor="member" className="block text-sm font-medium text-gray-700 mb-1">
            Socio
          </label>
          <select
            id="member"
            value={filters.member}
            onChange={(e) => onFilterChange('member', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
          >
            <option value="">Todos los socios</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} {member.second_name}
              </option>
            ))}
          </select>
        </div>

        {/* Sport Filter */}
        <div>
          <label htmlFor="sport" className="block text-sm font-medium text-gray-700 mb-1">
            Disciplina
          </label>
          <select
            id="sport"
            value={filters.sport}
            onChange={(e) => onFilterChange('sport', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
          >
            <option value="">Todas las disciplinas</option>
            <option value="societary">Cuota Societaria</option>
            {sports.map((sport) => (
              <option key={sport.id} value={sport.id}>
                {sport.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            id="status"
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="paid">Pagado</option>
            <option value="overdue">Vencido</option>
            <option value="partial">Parcialmente Pagado</option>
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo
          </label>
          <select
            id="type"
            value={filters.type}
            onChange={(e) => onFilterChange('type', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
          >
            <option value="">Todos los tipos</option>
            <option value="sport">Deportiva</option>
            <option value="societary">Societaria</option>
          </select>
        </div>

        {/* Date From */}
        <div>
          <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-1">
            Desde
          </label>
          <input
            type="date"
            id="dateFrom"
            value={filters.dateFrom}
            onChange={(e) => onFilterChange('dateFrom', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
          />
        </div>

        {/* Date To */}
        <div>
          <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-1">
            Hasta
          </label>
          <input
            type="date"
            id="dateTo"
            value={filters.dateTo}
            onChange={(e) => onFilterChange('dateTo', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
          />
        </div>
      </div>
    </div>
  );
};