import React, { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { useSports } from "../../../../hooks";
import { CreateUserRequest, UserPermissions } from "../../../../lib/types/auth";
import { AddUserModalProps } from "../types";
import { AppButton } from "../../../common/AppButton/component";
import { UserInfoSection } from "./UserInfoSection";
import { RoleStatusSection } from "./RoleStatusSection";
import { SportsSection } from "./SportsSection";
import { PermissionsSection } from "./PermissionsSection";
import "./styles.css";

const defaultPermissions: UserPermissions = {
  can_add: true,
  can_edit: true,
  can_delete: false,
  can_view: true,
  can_manage_payments: false,
  can_generate_reports: false,
};

const emptyForm: CreateUserRequest = {
  email: "",
  username: "",
  password: "",
  is_admin: false,
  is_active: true,
  sport_ids: [],
  permissions: defaultPermissions,
};

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const { sports } = useSports();
  const [formData, setFormData] = useState<CreateUserRequest>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shouldRender, setShouldRender] = useState(isOpen);

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

  if (!shouldRender) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.username || !formData.password) {
      setError("Por favor complete todos los campos requeridos");
      return;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      setLoading(true);
      await onSave(formData);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear usuario");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(emptyForm);
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
          <h2 className="modal-title">Agregar Nuevo Usuario</h2>
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

          <UserInfoSection formData={formData} setFormData={setFormData} />

          <RoleStatusSection formData={formData} setFormData={setFormData} />

          <SportsSection
            formData={formData}
            setFormData={setFormData}
            sports={sports}
            onSportToggle={handleSportToggle}
          />

          <PermissionsSection
            formData={formData}
            onPermissionToggle={handlePermissionToggle}
          />

          <div className="action-add-modal-button">
            <AppButton
              label="Cancelar"
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
            />
            <AppButton
              label={loading ? "Guardando..." : "Guardar Usuario"}
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
