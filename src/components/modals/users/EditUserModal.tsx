import React, { useState, useEffect } from "react";
import { X, User as UserIcon, Shield, Key, CheckSquare } from "lucide-react";
import { useSports } from "../../../hooks";
import { UpdateUserRequest, UserPermissions } from "../../../lib/types/auth";
import { Sport } from "../../../lib/types/sport";
import { EditUserModalProps } from "./types";

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

  if (!isOpen || !user) return null;

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#1a1a1a] text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <UserIcon className="w-6 h-6 text-[#FFD700]" />
            <h2 className="text-xl font-semibold">Editar Usuario</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-[#FFD700] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-[#1a1a1a]" />
                Información del Usuario
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usuario *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Dejar en blanco para mantener la actual
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#1a1a1a]" />
                Rol y Estado
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_admin}
                    onChange={(e) =>
                      setFormData({ ...formData, is_admin: e.target.checked })
                    }
                    className="w-4 h-4 text-[#1a1a1a] focus:ring-[#1a1a1a]"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Usuario Administrador
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="w-4 h-4 text-[#1a1a1a] focus:ring-[#1a1a1a]"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Usuario Activo
                  </span>
                </label>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-[#1a1a1a]" />
                Disciplinas Asignadas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {sports.map((sport: Sport) => (
                  <label
                    key={sport.id}
                    className="flex items-center gap-2 cursor-pointer p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.sport_ids?.includes(sport.id.toString())}
                      onChange={() => handleSportToggle(sport.id)}
                      className="w-4 h-4 text-[#1a1a1a] focus:ring-[#1a1a1a]"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {sport.name}
                    </span>
                  </label>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Key className="w-5 h-5 text-[#1a1a1a]" />
                Permisos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.permissions?.can_view}
                    onChange={() => handlePermissionToggle("can_view")}
                    className="w-4 h-4 text-[#1a1a1a] focus:ring-[#1a1a1a]"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Ver registros
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.permissions?.can_add}
                    onChange={() => handlePermissionToggle("can_add")}
                    className="w-4 h-4 text-[#1a1a1a] focus:ring-[#1a1a1a]"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Agregar registros
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.permissions?.can_edit}
                    onChange={() => handlePermissionToggle("can_edit")}
                    className="w-4 h-4 text-[#1a1a1a] focus:ring-[#1a1a1a]"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Editar registros
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.permissions?.can_delete}
                    onChange={() => handlePermissionToggle("can_delete")}
                    className="w-4 h-4 text-[#1a1a1a] focus:ring-[#1a1a1a]"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Eliminar registros
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.permissions?.can_manage_payments}
                    onChange={() => handlePermissionToggle("can_manage_payments")}
                    className="w-4 h-4 text-[#1a1a1a] focus:ring-[#1a1a1a]"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Gestionar pagos
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.permissions?.can_generate_reports}
                    onChange={() => handlePermissionToggle("can_generate_reports")}
                    className="w-4 h-4 text-[#1a1a1a] focus:ring-[#1a1a1a]"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Generar reportes
                  </span>
                </label>
              </div>
            </section>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#1a1a1a] text-white rounded-md hover:bg-[#2a2a2a] transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Actualizar Usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
