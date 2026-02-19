import React, { useState } from "react";
import { ChevronLeft, ChevronRight, User, Crown, Plus } from "lucide-react";
import { Member } from "../../lib/types/member";
import { Sport } from "../../lib/types/sport";

interface SportMembersListProps {
  members: Member[];
  sport: Sport;
  selectedMemberType: "all" | "primary" | "secondary";
}

export const SportMembersList: React.FC<SportMembersListProps> = ({
  members,
  sport,
  selectedMemberType,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [membersPerPage, setMembersPerPage] = useState(15);

  const indexOfLastMember = currentPage * membersPerPage;
  const indexOfFirstMember = indexOfLastMember - membersPerPage;
  const currentMembers = members.slice(indexOfFirstMember, indexOfLastMember);
  const totalPages = Math.ceil(members.length / membersPerPage);

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

  const getMemberSportInfo = (member: Member) => {
    const memberSport = member.sports?.find((s) => s.name === sport.name);
    return memberSport;
  };

  const getInitials = (name: string, secondName: string) => {
    const first = name.charAt(0);
    const second = secondName.charAt(0);
    return (first + second).toUpperCase();
  };

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

  if (members.length === 0) {
    return (
      <div
        className="empty-state-content"
        style={{ textAlign: "center", padding: "3rem" }}
      >
        <User
          className="empty-state-icon"
          style={{
            width: "4rem",
            height: "4rem",
            margin: "0 auto 1rem",
            color: "#d1d5db",
          }}
        />
        <p
          className="empty-state-title"
          style={{
            fontSize: "1.125rem",
            fontWeight: 500,
            color: "#111827",
            marginBottom: "0.5rem",
          }}
        >
          No hay socios registrados
        </p>
        <p className="empty-state-description" style={{ color: "#6b7280" }}>
          {selectedMemberType === "all"
            ? `No hay socios practicando ${sport.name}`
            : selectedMemberType === "primary"
              ? `No hay socios con ${sport.name} como disciplina principal`
              : `No hay socios con ${sport.name} como disciplina secundaria`}
        </p>
      </div>
    );
  }

  return (
    <div className="member-list-container">
      <div className="member-list-card">
        <div className="table-wrapper">
          <table className="member-table">
            <thead>
              <tr>
                <th>Socio</th>
                <th>DNI</th>
                <th>Tipo Disciplina</th>
                <th>Cuota Asignada</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {currentMembers.map((member) => {
                const sportInfo = getMemberSportInfo(member);
                const isPrincipal = sportInfo?.isPrincipal;

                return (
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
                          <p
                            className="member-email"
                            style={{ fontSize: "0.75rem", color: "#6b7280" }}
                          >
                            {member.birthdate}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="member-dni">{member.dni}</span>
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        {isPrincipal ? (
                          <>
                            <Crown className="h-4 w-4 text-yellow-500" />
                            <span
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: "#fef3c7",
                                color: "#92400e",
                                border: "1px solid #fde68a",
                              }}
                            >
                              Principal
                            </span>
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 text-blue-500" />
                            <span
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: "#dbeafe",
                                color: "#1e40af",
                                border: "1px solid #bfdbfe",
                              }}
                            >
                              Secundaria
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="member-sport-badge">
                        {sportInfo?.quotes && sportInfo.quotes.length > 0
                          ? sportInfo.quotes[0].name
                          : "No asignada"}
                      </span>
                    </td>
                    <td>
                      <span className="member-email">
                        {member.email || "-"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

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
