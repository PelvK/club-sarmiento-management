import React from 'react';
import { Filter, X, Trophy, User as UserIcon } from 'lucide-react';
import { GenerationHistoryFilterProps } from './types';
import './styles.css';

export const GenerationHistoryFilter: React.FC<GenerationHistoryFilterProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  sports,
  users,
  hasActiveFilters,
  resultCount
}) => {
  return (
    <div className="generation-history-filters-container">
      <div className="generation-history-filters-header">
        <div className="filter-header-left">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="filter-title">Filtros de búsqueda</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="clear-filters-btn"
            aria-label="Limpiar filtros"
          >
            <X className="w-4 h-4" />
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="generation-history-filters-grid">
        <div className="filter-field">
          <label htmlFor="sport" className="generation-history-filters-label">
            <Trophy className="w-4 h-4" />
            Disciplina
          </label>
          <select
            id="sport"
            value={filters.sport}
            onChange={(e) => onFilterChange('sport', e.target.value)}
            className="generation-history-filters-select"
          >
            <option value="">Todas las disciplinas</option>
            {sports && sports.map((sport) => (
              <option key={sport.id} value={sport.id}>
                {sport.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label htmlFor="createdBy" className="generation-history-filters-label">
            <UserIcon className="w-4 h-4" />
            Creado por
          </label>
          <select
            id="createdBy"
            value={filters.createdBy}
            onChange={(e) => onFilterChange('createdBy', e.target.value)}
            className="generation-history-filters-select"
          >
            <option value="">Todos los usuarios</option>
            {users && users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))}
          </select>
        </div>
      </div>

      {resultCount !== undefined && (
        <div className="filter-results-info">
          <span className="results-badge">
            {resultCount} {resultCount === 1 ? 'generación encontrada' : 'generaciones encontradas'}
          </span>
        </div>
      )}
    </div>
  );
};
