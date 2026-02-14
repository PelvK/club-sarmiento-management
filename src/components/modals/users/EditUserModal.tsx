import React, { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { useSports } from "../../../hooks";
import { UpdateUserRequest, UserPermissions } from "../../../lib/types/auth";
import { EditUserModalProps } from "./types";
import { AppButton } from "../../common/AppButton/component";
import { User, Shield, Trophy, Key } from "lucide-react";
import { Sport } from "../../../lib/types/sport";

const permissions = [
  {
    key: "can_view" as keyof UserPermissions,
    label: "Ver registros",
    description: "Permite visualizar la información del sistema",
  },
  {
    key: "can_add" as keyof UserPermissions,
    label: "Agregar registros",
    description: "Permite crear nuevos registros",
  },
  {
    key: "can_edit" as keyof UserPermissions,
    label: "Editar registros",
    description: "Permite modificar registros existentes",
  },
  {
    key: "can_delete" as keyof UserPermissions,
    label: "Eliminar registros",
    description: "Permite borrar registros del sistema",
  },
  {
    key: "can_manage_payments" as keyof UserPermissions,
    label: "Gestionar pagos",
    description: "Permite administrar los pagos y cuotas",
  },
  {
    key: "can_generate_reports" as keyof UserPermissions,
    label: "Generar reportes",
    description: "Permite crear y exportar reportes",
  },
];

export const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  onSave,
  user,
}) => {
  const { sports } = useSports();
  const [formData, setFormData] = useState<UpdateUserRequest>({
    email: "",
    username: "",
    password: "",
    is_admin: false,
    is_active: true,
    sport_ids: [],
    permissions: {
      can_add: true,
      can_edit: true,
      can_delete: false,
      can_view: true,
      can_manage_payments: false,
      can_generate_reports: false,
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        username: user.username,
        password: "",
        is_admin: user.is_admin,
        is_active: user.is_active,
        sport_ids: user.sport_supported?.map((s) => s.id.toString()) || [],
        permissions: user.permissions || {
          can_add: true,
          can_edit: true,
          can_delete: false,
          can_view: true,
          can_manage_payments: false,
          can_generate_reports: false,
        },
      });
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {
      const timeout = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (!shouldRender || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.username) {
      setError("Por favor complete todos los campos requeridos");
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      setLoading(true);
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }
      await onSave(user.id, updateData);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar usuario");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSportToggle = (sportId: number) => {
    setFormData((prev) => {
      const currentSports = prev.sport_ids || [];
      const sportIdStr = sportId.toString();

      if (currentSports.includes(sportIdStr)) {
        return {
          ...prev,
          sport_ids: currentSports.filter((id) => id !== sportIdStr),
        };
      } else {
        return {
          ...prev,
          sport_ids: [...currentSports, sportIdStr],
        };
      }
    });
  };

  const handlePermissionToggle = (permission: keyof UserPermissions) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions!,
        [permission]: !prev.permissions![permission],
      },
    }));
  };

  return (
    <div className={`modal-overlay ${isOpen ? "fade-in" : "fade-out"}`}>
      <div className={`modal-content ${isOpen ? "scale-in" : "scale-out"}`}>
        <div className="modal-header">
          <h2 className="modal-title">Editar Usuario</h2>
          <button
            onClick={handleClose}
            className="modal-close-btn"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="error-message">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Información del Usuario */}
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
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="modal-form-input"
                  minLength={6}
                  placeholder="Dejar en blanco para mantener la actual"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Dejar en blanco para mantener la contraseña actual
                </p>
              </div>
            </div>
          </div>

          {/* Rol y Estado */}
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

          {/* Disciplinas Asignadas */}
          <div className="section-card">
            <div className="section-header">
              <Trophy className="section-icon" />
              <h3 className="section-title">Disciplinas Asignadas</h3>
            </div>

            <div className="sports-grid">
              {sports.map((sport: Sport) => {
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
                        onChange={() => handleSportToggle(sport.id)}
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

          {/* Permisos */}
          <div className="section-card">
            <div className="section-header">
              <Key className="section-icon" />
              <h3 className="section-title">Permisos</h3>
            </div>

            <div className="permissions-grid">
              {permissions.map((permission) => (
                <div key={permission.key} className="toggle-item">
                  <div className="toggle-label">
                    <span className="toggle-label-text">{permission.label}</span>
                    <span className="toggle-label-desc">{permission.description}</span>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={formData.permissions?.[permission.key] || false}
                      onChange={() => handlePermissionToggle(permission.key)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="action-add-modal-button">
            <AppButton
              label="Cancelar"
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
            />
            <AppButton
              label={loading ? "Guardando..." : "Actualizar Usuario"}
              type="submit"
              variant="primary"
              disabled={loading}
            />
          </div>
        </form>
      </div>
    </div>
  );
};
