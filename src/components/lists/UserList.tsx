import React, { useState } from "react";
import { Pencil, Trash2, Eye, ChevronLeft, ChevronRight, CheckCircle, XCircle } from "lucide-react";
import { User } from "../../lib/types/auth";

type UserListProps = {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onDetails: (user: User) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
};

export const UserList: React.FC<UserListProps> = ({
  users,
  onEdit,
  onDelete,
  onDetails,
  onToggleActive,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 15;

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#1a1a1a]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#FFD700] uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#FFD700] uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#FFD700] uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#FFD700] uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#FFD700] uppercase tracking-wider">
                  Disciplinas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#FFD700] uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.is_admin
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.is_admin ? "Administrador" : "Usuario"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => onToggleActive(user.id, !user.is_active)}
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center gap-1 transition-colors ${
                          user.is_active
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                      >
                        {user.is_active ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            Activo
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            Inactivo
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user?.sport_supported && user.sport_supported.length > 0
                        ? user.sport_supported.map((s) => s.name).join(", ")
                        : "Ninguna"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onDetails(user)}
                          className="text-green-600 hover:text-green-800 transition-colors"
                          aria-label="Detalles"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => onEdit(user)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          aria-label="Editar"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => onDelete(user.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          aria-label="Eliminar"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No hay usuarios para mostrar
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {users.length > 0 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 mt-4 shadow-md rounded-lg">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Anterior
            </button>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`relative ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando{" "}
                <span className="font-medium">{indexOfFirstUser + 1}</span> a{" "}
                <span className="font-medium">
                  {Math.min(indexOfLastUser, users.length)}
                </span>{" "}
                de <span className="font-medium">{users.length}</span> usuarios
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="bg-[#1a1a1a] text-[#FFD700] relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium">
                  {currentPage} / {totalPages}
                </div>
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                  aria-label="Next page"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
