import React, { useState } from "react";
import { Pencil, Trash2, Eye, ChevronLeft, ChevronRight, CheckCircle, XCircle, Users } from "lucide-react";
import { User } from "../../../lib/types/auth";
import "./styles.css";

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
  const [usersPerPage, setUsersPerPage] = useState(15);

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

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);

  const getInitials = (username: string) => {
    const words = username.split(' ');
    if (words.length >= 2) {
      return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (username: string) => {
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    ];
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="user-list-container">
      <div className="user-list-card">
        <div className="table-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Disciplinas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <tr key={user.id} className="user-row">
                    <td>
                      <div className="user-info">
                        <div
                          className="user-avatar"
                          style={{ background: getAvatarColor(user.username) }}
                        >
                          {getInitials(user.username)}
                        </div>
                        <div className="user-details">
                          <p className="user-name">{user.username}</p>
                          <p className="user-email">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`role-badge ${
                          user.is_admin ? "role-admin" : "role-user"
                        }`}
                      >
                        {user.is_admin ? "Administrador" : "Usuario"}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => onToggleActive(user.id, !user.is_active)}
                        className={`status-badge ${
                          user.is_active ? "status-active" : "status-inactive"
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
                    <td>
                      <div className="sports-badges">
                        {user?.sport_supported && user.sport_supported.length > 0 ? (
                          <>
                            {user.sport_supported.slice(0, 2).map((sport, idx) => (
                              <span key={idx} className="sport-badge">
                                {sport.name}
                              </span>
                            ))}
                            {user.sport_supported.length > 2 && (
                              <span className="sport-badge-more">
                                +{user.sport_supported.length - 2}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="sport-badge sport-badge-empty">
                            Sin deportes
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => onDetails(user)}
                          className="action-btn action-btn-view"
                          aria-label="Ver detalles"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(user)}
                          className="action-btn action-btn-edit"
                          aria-label="Editar"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(user.id)}
                          className="action-btn action-btn-delete"
                          aria-label="Eliminar"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="empty-state">
                    <div className="empty-state-content">
                      <Users className="empty-state-icon" />
                      <p className="empty-state-title">No hay usuarios para mostrar</p>
                      <p className="empty-state-description">
                        Intenta ajustar los filtros o agrega un nuevo usuario
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {users.length > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            <p className="pagination-text">
              Mostrando{" "}
              <span className="pagination-highlight">{indexOfFirstUser + 1}</span> a{" "}
              <span className="pagination-highlight">
                {Math.min(indexOfLastUser, users.length)}
              </span>{" "}
              de <span className="pagination-highlight">{users.length}</span> usuarios
            </p>
            <div className="items-per-page">
              <label htmlFor="itemsPerPage">Mostrar:</label>
              <select
                id="itemsPerPage"
                value={usersPerPage}
                onChange={(e) => {
                  setUsersPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="items-select"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <nav className="pagination-nav" aria-label="Pagination">
            <button
              onClick={goToFirstPage}
              disabled={currentPage === 1}
              className="pagination-btn"
              aria-label="Primera página"
            >
              <ChevronLeft className="w-4 h-4" />
              <ChevronLeft className="w-4 h-4 -ml-2" />
            </button>
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="pagination-btn"
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="pagination-current">
              <span>{currentPage}</span>
              <span className="pagination-separator">/</span>
              <span>{totalPages}</span>
            </div>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="pagination-btn"
              aria-label="Página siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              className="pagination-btn"
              aria-label="Última página"
            >
              <ChevronRight className="w-4 h-4" />
              <ChevronRight className="w-4 h-4 -ml-2" />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};
