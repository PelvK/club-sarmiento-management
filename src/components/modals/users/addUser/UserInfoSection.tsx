import React from "react";
import { User } from "lucide-react";
import { CreateUserRequest } from "../../../../lib/types/auth";

type UserInfoSectionProps = {
  formData: CreateUserRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateUserRequest>>;
};

export const UserInfoSection: React.FC<UserInfoSectionProps> = ({
  formData,
  setFormData,
}) => {
  return (
    <div className="section-card">
      <div className="section-header">
        <User className="section-icon" />
        <h3 className="section-title">Información del Usuario</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="username" className="modal-form-label">
            Usuario *
          </label>
          <input
            type="text"
            id="username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            className="modal-form-input"
            required
            placeholder="Ingrese el nombre de usuario"
          />
        </div>

        <div>
          <label htmlFor="email" className="modal-form-label">
            Email *
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="modal-form-input"
            required
            placeholder="ejemplo@correo.com"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="password" className="modal-form-label">
            Contraseña *
          </label>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="modal-form-input"
            required
            minLength={6}
            placeholder="Mínimo 6 caracteres"
          />
          <p className="text-xs text-gray-500 mt-1">
            La contraseña debe tener al menos 6 caracteres
          </p>
        </div>
      </div>
    </div>
  );
};
