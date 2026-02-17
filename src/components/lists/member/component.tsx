import React, { useCallback, useState } from "react";
import {
  Pencil,
  Eye,
  ChevronLeft,
  ChevronRight,
  User,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Member } from "../../../lib/types/member";
import { useAuth } from "../../../hooks/useAuth";
import "./styles.css";

type MemberListProps = {
  members: Member[];
  onEdit: (member: Member) => void;
  onDelete: (id: number) => void;
  onDetails: (member: Member) => void;
  onToggleActive: (id: number, isActive: boolean) => void;
};

export const MemberList: React.FC<MemberListProps> = ({
  members,
  onEdit,
  onToggleActive,
/*   onDelete,
 */  onDetails,
}) => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [membersPerPage, setMembersPerPage] = useState(15);

  // Calculate pagination
  const indexOfLastMember = currentPage * membersPerPage;
  const indexOfFirstMember = indexOfLastMember - membersPerPage;
  const currentMembers = members.slice(indexOfFirstMember, indexOfLastMember);
  const totalPages = Math.ceil(members.length / membersPerPage);

  // Change page
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

  // Función para generar iniciales
  const getInitials = (name: string, secondName: string) => {
    return `${name.charAt(0)}${secondName.charAt(0)}`.toUpperCase();
  };

  const handleToggleActive = useCallback(
    (id: number, active: boolean) => {
      console.log(user)
      if (!user?.permissions?.can_toggle_activate) return;
      onToggleActive(id, active);
    },
    [onToggleActive, user],
  );

  const getAvatarColor = (name: string) => {
    const colors = [
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="member-list-container">
      <div className="member-list-card">
        <div className="table-wrapper">
          <table className="member-table">
            <thead>
              <tr>
                <th>Socio</th>
                <th>DNI</th>
                <th>Nacimiento</th>
                <th>Deportes</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentMembers.length > 0 ? (
                currentMembers.map((member) => (
                  <tr key={member.id} className="member-row">
                    <td>
                      <div className="member-info">
                        <div
                          className="member-avatar"
                          style={{ background: getAvatarColor(member.name) }}
                        >
                          {getInitials(member.name, member.second_name)}
                        </div>
                        <div className="member-details">
                          <p className="member-name">
                            {member.name} {member.second_name}
                          </p>
                          {member.email && (
                            <p className="member-email">{member.email}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="member-dni">{member.dni}</span>
                    </td>
                    <td>
                      <span className="member-date">{member.birthdate}</span>
                    </td>
                    <td>
                      <div className="member-sports-badges">
                        {member?.sports && member.sports.length > 0 ? (
                          member.sports.slice(0, 2).map((sport, idx) => (
                            <span key={idx} className="member-sport-badge">
                              {sport.name}
                            </span>
                          ))
                        ) : (
                          <span className="member-sport-badge member-sport-badge-empty">
                            Sin deportes
                          </span>
                        )}
                        {member?.sports && member.sports.length > 2 && (
                          <span className="member-sport-badge-more">
                            +{member.sports.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() =>
                          handleToggleActive(member.id, !member.active)
                        }
                        className={`member-status-badge ${
                          member.active
                            ? "member-status-active"
                            : "member-status-inactive"
                        }`}
                      >
                        {member.active ? (
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
                      <div className="member-action-buttons">
                        <button
                          onClick={() => onDetails(member)}
                          className="member-action-btn member-action-btn-view"
                          aria-label="Ver detalles"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {user?.permissions?.can_edit && (
                          <button
                            onClick={() => onEdit(member)}
                            className="member-action-btn member-action-btn-edit"
                            aria-label="Editar"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
{/*                         {user?.permissions?.can_delete && (
                          <button
                            onClick={() => onDelete(member.id)}
                            className="member-action-btn member-action-btn-delete"
                            aria-label="Eliminar"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )} */}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="empty-state">
                    <div className="empty-state-content">
                      <User className="empty-state-icon" />
                      <p className="empty-state-title">
                        No hay socios para mostrar
                      </p>
                      <p className="empty-state-description">
                        Intenta ajustar los filtros o agrega un nuevo socio
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {members.length > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            <p className="pagination-text">
              Mostrando{" "}
              <span className="pagination-highlight">
                {indexOfFirstMember + 1}
              </span>{" "}
              a{" "}
              <span className="pagination-highlight">
                {Math.min(indexOfLastMember, members.length)}
              </span>{" "}
              de <span className="pagination-highlight">{members.length}</span>{" "}
              socios
            </p>
            <div className="items-per-page">
              <label htmlFor="itemsPerPage">Mostrar:</label>
              <select
                id="itemsPerPage"
                value={membersPerPage}
                onChange={(e) => {
                  setMembersPerPage(Number(e.target.value));
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
