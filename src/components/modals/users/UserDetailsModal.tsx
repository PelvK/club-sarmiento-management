import React from "react";
import { X, User as UserIcon, Mail, Shield, Calendar, CheckCircle, XCircle, Key } from "lucide-react";
import { UserDetailsModalProps } from "./types";

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#1a1a1a] text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <UserIcon className="w-6 h-6 text-[#FFD700]" />
            <h2 className="text-xl font-semibold">Detalles del Usuario</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-[#FFD700] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <section className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-[#1a1a1a]" />
              Información Básica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Usuario</label>
                <p className="text-base text-gray-900 mt-1">{user.username}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <p className="text-base text-gray-900 mt-1">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Fecha de Creación
                </label>
                <p className="text-base text-gray-900 mt-1">
                  {new Date(user.created_at).toLocaleDateString("es-AR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </section>

          <section className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#1a1a1a]" />
              Rol y Estado
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500">Rol:</span>
                <span
                  className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
                    user.is_admin
                      ? "bg-purple-100 text-purple-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {user.is_admin ? "Administrador" : "Usuario"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500">Estado:</span>
                <span
                  className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full items-center gap-1 ${
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
          </section>

          <section className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Disciplinas Asignadas</h3>
            {user.sport_supported && user.sport_supported.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.sport_supported.map((sport) => (
                  <span
                    key={sport.id}
                    className="px-3 py-1 bg-[#1a1a1a] text-white text-sm rounded-full"
                  >
                    {sport.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                No tiene disciplinas asignadas
              </p>
            )}
          </section>

          <section className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-[#1a1a1a]" />
              Permisos
            </h3>
            {user.permissions ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  {user.permissions.can_view ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="text-sm">Ver registros</span>
                </div>
                <div className="flex items-center gap-2">
                  {user.permissions.can_add ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="text-sm">Agregar registros</span>
                </div>
                <div className="flex items-center gap-2">
                  {user.permissions.can_edit ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="text-sm">Editar registros</span>
                </div>
                <div className="flex items-center gap-2">
                  {user.permissions.can_delete ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="text-sm">Eliminar registros</span>
                </div>
                <div className="flex items-center gap-2">
                  {user.permissions.can_manage_payments ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="text-sm">Gestionar pagos</span>
                </div>
                <div className="flex items-center gap-2">
                  {user.permissions.can_generate_reports ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="text-sm">Generar reportes</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                No se han configurado permisos
              </p>
            )}
          </section>
        </div>

        <div className="p-6 bg-gray-50 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-[#1a1a1a] text-white rounded-md hover:bg-[#2a2a2a] transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
