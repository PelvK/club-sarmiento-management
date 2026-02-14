import React from "react";
import { Key } from "lucide-react";
import { CreateUserRequest, UserPermissions } from "../../../../lib/types/auth";

type PermissionsSectionProps = {
  formData: CreateUserRequest;
  onPermissionToggle: (permission: keyof UserPermissions) => void;
};

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

export const PermissionsSection: React.FC<PermissionsSectionProps> = ({
  formData,
  onPermissionToggle,
}) => {
  return (
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
                onChange={() => onPermissionToggle(permission.key)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};
