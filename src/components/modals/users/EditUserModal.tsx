import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useSports } from "../../../hooks";
import { UpdateUserRequest, UserPermissions } from "../../../lib/types/auth";
import { EditUserModalProps } from "./types";
import { AppButton } from "../../common/AppButton/component";
import { User, Shield, Trophy, Key } from "lucide-react";
import { Sport } from "../../../lib/types/sport";
import { ConfirmationModal } from "../common/confirmationModal/component";
import { ErrorModal } from "../common/ErrorModal";
import { useErrorHandler } from "../../../hooks/useErrorHandler";

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
  {
    key: "can_toggle_activate" as keyof UserPermissions,
    label: "Activar / Desactivar entidades",
    description:
      "Permite activar o desactivar el estado de socios y otros usuarios",
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
      can_toggle_activate: false,
    },
  });
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingUpdateData, setPendingUpdateData] =
    useState<UpdateUserRequest | null>(null);
  const { error, isErrorModalOpen, handleError, closeErrorModal } =
    useErrorHandler();

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
          can_toggle_activate: false,
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

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.username) {
      handleError("Por favor complete todos los campos requeridos");
      return;
    }

    if (formData.password && formData.password.length < 6) {
      handleError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setPendingUpdateData(formData);
    setShowConfirmation(true);
  };

  const handleConfirmUpdate = async () => {
    if (!pendingUpdateData) return;
    setIsUpdating(true);
    try {
      await onSave(user.id, pendingUpdateData);
      setShowConfirmation(false);
      setPendingUpdateData(null);
    } catch (error) {
      setShowConfirmation(false);
      setPendingUpdateData(null);
      setTimeout(() => {
        handleError(error);
      }, 100);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    handleError(null);
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

        <form onSubmit={handleUpdate} className="modal-form">
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
                  <span className="toggle-label-text">
                    Usuario Administrador
                  </span>
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
                const isSelected = formData.sport_ids?.includes(
                  sport.id.toString(),
                );

                return (
                  <div
                    key={sport.id}
                    className={`sport-item ${isSelected ? "selected" : ""}`}
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
                    <span className="toggle-label-text">
                      {permission.label}
                    </span>
                    <span className="toggle-label-desc">
                      {permission.description}
                    </span>
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
            />
            <AppButton
              label={"Actualizar Usuario"}
              type="submit"
              variant="primary"
            />
          </div>
        </form>
      </div>
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => {
          setShowConfirmation(false);
          setPendingUpdateData(null);
        }}
        onConfirm={handleConfirmUpdate}
        title="¿Confirmar actualización de usuario?"
        message={`¿Estás seguro de que deseas realizar cambios en el usuario ${formData.email}?`}
        confirmText="Sí, actualizar"
        cancelText="No, revisar"
        type="success"
        isLoading={isUpdating}
      />

      {error && (
        <ErrorModal
          isOpen={isErrorModalOpen}
          onClose={closeErrorModal}
          error={error}
          showDetails={process.env.NODE_ENV === "development"}
        />
      )}
    </div>
  );
};
