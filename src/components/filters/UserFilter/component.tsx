import React from 'react';
import { UsersFilterProps } from './types';
import './styles.css';

export const UsersFilter: React.FC<UsersFilterProps> = ({
  filters,
  onFilterChange,
  sports
}) => {
  return (
    <div className="users-filters-container">
      <div className="users-filters-grid">
        <div>
          <label htmlFor="username" className="users-filters-label">
            Usuario
          </label>
          <div>
            <input
              type="text"
              id="username"
              value={filters.username?.toString() || ''}
              onChange={(e) => onFilterChange('username', e.target.value)}
              className="users-filters-input"
              placeholder="Buscar por usuario..."
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="users-filters-label">
            Email
          </label>
          <input
            type="text"
            id="email"
            value={filters.email?.toString() || ''}
            onChange={(e) => onFilterChange('email', e.target.value)}
            className="users-filters-input"
            placeholder="Buscar por email..."
          />
        </div>

        <div>
          <label htmlFor="role" className="users-filters-label">
            Rol
          </label>
          <select
            id="role"
            value={filters.role?.toString() || 'all'}
            onChange={(e) => onFilterChange('role', e.target.value)}
            className="users-filters-select"
          >
            <option value="all">Todos los roles</option>
            <option value="admin">Administrador</option>
            <option value="user">Usuario</option>
          </select>
        </div>

        <div>
          <label htmlFor="status" className="users-filters-label">
            Estado
          </label>
          <select
            id="status"
            value={filters.status?.toString() || 'all'}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="users-filters-select"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>

        <div>
          <label htmlFor="sport" className="users-filters-label">
            Disciplina
          </label>
          <select
            id="sport"
            value={filters.sport?.toString() || 'all'}
            onChange={(e) => onFilterChange('sport', e.target.value)}
            className="users-filters-select"
          >
            <option value="all">Todas las disciplinas</option>
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
