import React, { useState, useEffect } from "react";
import { X, User as UserIcon, Mail, Shield, Calendar, CheckCircle, XCircle, Key, Trophy } from "lucide-react";
import { UserDetailsModalProps } from "./types";
import { AppButton } from "../../common/AppButton/component";
import "./addUser/styles.css";

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
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

  if (!shouldRender || !user) return null;

  return (
    <div className={`modal-overlay ${isOpen ? "fade-in" : "fade-out"}`}>
      <div className={`modal-content ${isOpen ? "scale-in" : "scale-out"}`}>
        <div className="modal-header">
          <h2 className="modal-title">Detalles del Usuario</h2>
          <button
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-form">
          {/* Información Básica */}
          <div className="section-card">
            <div className="section-header">
              <UserIcon className="section-icon" />
              <h3 className="section-title">Información Básica</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="modal-form-label">Usuario</label>
                <div className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-900">{user.username}</p>
                </div>
              </div>

              <div>
                <label className="modal-form-label flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <div className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-900">{user.email}</p>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="modal-form-label flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Fecha de Creación
                </label>
                <div className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-900">
                    {new Date(user.created_at).toLocaleDateString("es-AR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Rol y Estado */}
          <div className="section-card">
            <div className="section-header">
              <Shield className="section-icon" />
              <h3 className="section-title">Rol y Estado</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="modal-form-label">Rol</label>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-4 py-2 inline-flex text-sm font-semibold rounded-lg ${
                      user.is_admin
                        ? "bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-gray-900"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {user.is_admin ? "Administrador" : "Usuario"}
                  </span>
                </div>
              </div>

              <div>
                <label className="modal-form-label">Estado</label>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-4 py-2 inline-flex text-sm font-semibold rounded-lg items-center gap-2 ${
                      user.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.is_active ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Activo
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        Inactivo
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Disciplinas Asignadas */}
          <div className="section-card">
            <div className="section-header">
              <Trophy className="section-icon" />
              <h3 className="section-title">Disciplinas Asignadas</h3>
            </div>

            {user.sport_supported && user.sport_supported.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.sport_supported.map((sport) => (
                  <span
                    key={sport.id}
                    className="px-4 py-2 bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] text-white text-sm font-medium rounded-lg shadow-sm"
                  >
                    {sport.name}
                  </span>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-500 text-center">
                  No tiene disciplinas asignadas
                </p>
              </div>
            )}
          </div>

          {/* Permisos */}
          <div className="section-card">
            <div className="section-header">
              <Key className="section-icon" />
              <h3 className="section-title">Permisos</h3>
            </div>

            {user.permissions ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                  {user.permissions.can_view ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                  <div>
                    <span className="text-sm font-medium text-gray-900 block">
                      Ver registros
                    </span>
                    <span className="text-xs text-gray-500">
                      Visualizar información del sistema
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                  {user.permissions.can_add ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                  <div>
                    <span className="text-sm font-medium text-gray-900 block">
                      Agregar registros
                    </span>
                    <span className="text-xs text-gray-500">
                      Crear nuevos registros
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                  {user.permissions.can_edit ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                  <div>
                    <span className="text-sm font-medium text-gray-900 block">
                      Editar registros
                    </span>
                    <span className="text-xs text-gray-500">
                      Modificar registros existentes
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                  {user.permissions.can_delete ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                  <div>
                    <span className="text-sm font-medium text-gray-900 block">
                      Eliminar registros
                    </span>
                    <span className="text-xs text-gray-500">
                      Borrar registros del sistema
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                  {user.permissions.can_manage_payments ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                  <div>
                    <span className="text-sm font-medium text-gray-900 block">
                      Gestionar pagos
                    </span>
                    <span className="text-xs text-gray-500">
                      Administrar pagos y cuotas
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                  {user.permissions.can_generate_reports ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                  <div>
                    <span className="text-sm font-medium text-gray-900 block">
                      Generar reportes
                    </span>
                    <span className="text-xs text-gray-500">
                      Crear y exportar reportes
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-500 text-center">
                  No se han configurado permisos
                </p>
              </div>
            )}
          </div>

          <div className="action-add-modal-button">
            <AppButton
              label="Cerrar"
              type="button"
              variant="primary"
              onClick={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
