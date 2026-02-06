import React from 'react';
import { MemberFilterProps } from './types';
import './styles.css';

export const MemberFilter: React.FC<MemberFilterProps> = ({
  filters,
  onFilterChange,
  sports
}) => {
  return (
    <div className="member-filters-container">
      <div className="member-filters-grid">
        <div>
          <label htmlFor="name" className="member-filters-label">
            Nombre o apellido
          </label>
          <div>
            <input
              type="text"
              id="name"
              value={filters.name?.toString()}
              onChange={(e) => onFilterChange('name', e.target.value)}
              className="member-filters-input"
              placeholder="Buscar por nombre..."
            />
          </div>
        </div>

        <div>
          <label htmlFor="dni" className="member-filters-label">
            DNI
          </label>
          <input
            type="text"
            id="dni"
            value={filters.dni?.toString()}
            onChange={(e) => onFilterChange('dni', e.target.value)}
            className="member-filters-input"
            placeholder="Buscar por DNI..."
          />
        </div>

        <div>
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
    </div>
  );
};
