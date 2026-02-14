import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import { MemberFilterProps } from './types';
import './styles.css';

export const MemberFilter: React.FC<MemberFilterProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  sports,
  hasActiveFilters,
  resultCount
}) => {
  return (
    <div className="member-filters-container">
      <div className="member-filters-header">
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

      <div className="member-filters-grid">
        <div className="filter-field">
          <label htmlFor="name" className="member-filters-label">
            Nombre o apellido
          </label>
          <div className="input-with-icon">
            <Search className="input-icon" />
            <input
              type="text"
              id="name"
              value={filters.name?.toString()}
              onChange={(e) => onFilterChange('name', e.target.value)}
              className="member-filters-input"
              placeholder="Buscar por nombre..."
            />
            {filters.name && (
              <button
                onClick={() => onFilterChange('name', '')}
                className="input-clear-btn"
                aria-label="Limpiar campo"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="filter-field">
          <label htmlFor="dni" className="member-filters-label">
            DNI
          </label>
          <div className="input-with-icon">
            <Search className="input-icon" />
            <input
              type="text"
              id="dni"
              value={filters.dni?.toString()}
              onChange={(e) => onFilterChange('dni', e.target.value)}
              className="member-filters-input"
              placeholder="Buscar por DNI..."
            />
            {filters.dni && (
              <button
                onClick={() => onFilterChange('dni', '')}
                className="input-clear-btn"
                aria-label="Limpiar campo"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="filter-field">
          <label htmlFor="sport" className="member-filters-label">
            Disciplina
          </label>
          <select
            id="sport"
            value={filters.sport?.toString()}
            onChange={(e) => onFilterChange('sport', e.target.value)}
            className="member-filters-select"
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

      {resultCount !== undefined && (
        <div className="filter-results-info">
          <span className="results-badge">
            {resultCount} {resultCount === 1 ? 'socio encontrado' : 'socios encontrados'}
          </span>
        </div>
      )}
    </div>
  );
};