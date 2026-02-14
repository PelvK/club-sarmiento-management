import React from "react";
import { Shield } from "lucide-react";
import { CreateUserRequest } from "../../../../lib/types/auth";

type RoleStatusSectionProps = {
  formData: CreateUserRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateUserRequest>>;
};

export const RoleStatusSection: React.FC<RoleStatusSectionProps> = ({
  formData,
  setFormData,
}) => {
  return (
    <div className="section-card">
      <div className="section-header">
        <Shield className="section-icon" />
        <h3 className="section-title">Rol y Estado</h3>
      </div>

      <div className="space-y-3">
        <div className="toggle-item">
          <div className="toggle-label">
            <span className="toggle-label-text">Usuario Administrador</span>
            <span className="toggle-label-desc">
              Los administradores tienen acceso completo al sistema
            </span>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={formData.is_admin}
              onChange={(e) =>
                setFormData({ ...formData, is_admin: e.target.checked })
              }
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="toggle-item">
          <div className="toggle-label">
            <span className="toggle-label-text">Usuario Activo</span>
            <span className="toggle-label-desc">
              Solo los usuarios activos pueden iniciar sesión
            </span>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData({ ...formData, is_active: e.target.checked })
              }
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>
  );
};
