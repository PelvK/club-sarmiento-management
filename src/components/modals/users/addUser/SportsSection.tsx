import React from "react";
import { Trophy } from "lucide-react";
import { Sport } from "../../../../lib/types/sport";
import { CreateUserRequest } from "../../../../lib/types/auth";

type SportsSectionProps = {
  formData: CreateUserRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateUserRequest>>;
  sports: Sport[];
  onSportToggle: (sportId: number) => void;
};

export const SportsSection: React.FC<SportsSectionProps> = ({
  formData,
  sports,
  onSportToggle,
}) => {
  return (
    <div className="section-card">
      <div className="section-header">
        <Trophy className="section-icon" />
        <h3 className="section-title">Disciplinas Asignadas</h3>
      </div>

      <div className="sports-grid">
        {sports.map((sport) => {
          const isSelected = formData.sport_ids?.includes(sport.id.toString());

          return (
            <div
              key={sport.id}
              className={`sport-item ${isSelected ? 'selected' : ''}`}
            >
              <span className="sport-name">{sport.name}</span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onSportToggle(sport.id)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          );
        })}
      </div>

      {sports.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          No hay disciplinas disponibles
        </p>
      )}
    </div>
  );
};
