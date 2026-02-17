import React from "react";
import { Search, X, Filter } from "lucide-react";
import { UsersFilterProps } from "./types";
import "./styles.css";

export const UsersFilter: React.FC<UsersFilterProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  sports,
  hasActiveFilters,
  resultCount,
}) => {
  return (
    <div className="user-filters-container">
      <div className="user-filters-header">
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

      <div className="user-filters-grid">
        <div className="filter-field">
          <label htmlFor="username" className="user-filters-label">
            Usuario
          </label>
          <div className="input-with-icon">
            <Search className="input-icon" />
            <input
              type="text"
              id="username"
              value={filters.username?.toString() || ""}
              onChange={(e) => onFilterChange("username", e.target.value)}
              className="user-filters-input"
              placeholder="Buscar por usuario..."
            />
            {filters.username && (
              <button
                onClick={() => onFilterChange("username", "")}
                className="input-clear-btn"
                aria-label="Limpiar campo"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="filter-field">
          <label htmlFor="email" className="user-filters-label">
            Email
          </label>
          <div className="input-with-icon">
            <Search className="input-icon" />
            <input
              type="text"
              id="email"
              value={filters.email?.toString() || ""}
              onChange={(e) => onFilterChange("email", e.target.value)}
              className="user-filters-input"
              placeholder="Buscar por email..."
            />
            {filters.email && (
              <button
                onClick={() => onFilterChange("email", "")}
                className="input-clear-btn"
                aria-label="Limpiar campo"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="filter-field">
          <label htmlFor="role" className="user-filters-label">
            Rol
          </label>
          <select
            id="role"
            value={filters.role?.toString() || "all"}
            onChange={(e) => onFilterChange("role", e.target.value)}
            className="user-filters-select"
          >
            <option value="all">Todos los roles</option>
            <option value="admin">Administrador</option>
            <option value="user">Usuario</option>
          </select>
        </div>

        <div className="filter-field">
          <label htmlFor="status" className="user-filters-label">
            Estado
          </label>
          <select
            id="status"
            value={filters.status?.toString() || "all"}
            onChange={(e) => onFilterChange("status", e.target.value)}
            className="user-filters-select"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>

        <div className="filter-field">
          <label htmlFor="sport" className="user-filters-label">
            Disciplina
          </label>
          <select
            id="sport"
            value={filters.sport?.toString() || "all"}
            onChange={(e) => onFilterChange("sport", e.target.value)}
            className="user-filters-select"
          >
            <option value="all">Todas las disciplinas</option>
            {sports &&
              sports?.map((sport) => (
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
            {resultCount} {resultCount === 1 ? 'usuario encontrado' : 'usuarios encontrados'}
          </span>
        </div>
      )}
    </div>
  );
};