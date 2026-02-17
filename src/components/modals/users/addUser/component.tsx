import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useSports } from "../../../../hooks";
import { CreateUserRequest, UserPermissions } from "../../../../lib/types/auth";
import { AddUserModalProps } from "../types";
import { AppButton } from "../../../common/AppButton/component";
import { UserInfoSection } from "./UserInfoSection";
import { RoleStatusSection } from "./RoleStatusSection";
import { SportsSection } from "./SportsSection";
import { PermissionsSection } from "./PermissionsSection";
import "./styles.css";
import { ConfirmationModal } from "../../common/confirmationModal/component";
import { ErrorModal } from "../../common/ErrorModal";
import { useErrorHandler } from "../../../../hooks/useErrorHandler";

const defaultPermissions: UserPermissions = {
  can_add: true,
  can_edit: true,
  can_delete: false,
  can_view: true,
  can_manage_payments: false,
  can_generate_reports: false,
  can_toggle_activate: false,
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
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState<CreateUserRequest | null>(
    null,
  );
  const { error, isErrorModalOpen, handleError, closeErrorModal } =
    useErrorHandler();

  useEffect(() => {
    setFormData(emptyForm);
  }, []);
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

    if (!formData.email || !formData.username || !formData.password) {
      handleError("Por favor complete todos los campos requeridos");
      return;
    }

    if (formData.password.length < 6) {
      handleError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setPendingSubmit(formData);
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    if (!pendingSubmit) return;

    setIsSubmiting(true);

    try {
      await onSave(pendingSubmit);
      setShowConfirmation(false);
      setPendingSubmit(null);
      onClose();
    } catch (error) {
      setShowConfirmation(false);
      setPendingSubmit(null);
      setTimeout(() => {
        handleError(error);
      }, 100);
    } finally {
      setIsSubmiting(false);
    }
  };

  const handleClose = () => {
    setFormData(emptyForm);
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
            />
            <AppButton
              label={"Guardar Usuario"}
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
          setPendingSubmit(null);
        }}
        onConfirm={handleConfirmSubmit}
        title="¿Confirmar creación de user?"
        message={`¿Estás seguro de que deseas agregar el usuario ${formData.email}?`}
        confirmText="Sí, agregar"
        cancelText="No, revisar"
        type="success"
        isLoading={isSubmiting}
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
