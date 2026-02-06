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
  const membersPerPage = 10;

  // Calculate pagination
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

  const getMemberSportInfo = (member: Member) => {
    const memberSport = member.sports?.find(s => s.name === sport.name);
    return memberSport;
  };

  const getTypeIcon = (member: Member) => {
    const memberSport = getMemberSportInfo(member);
    if (memberSport?.isPrincipal) {
      return <Crown className="h-4 w-4 text-yellow-500" />;
    }
    return <Plus className="h-4 w-4 text-blue-500" />;
  };

  const getTypeText = (member: Member) => {
    const memberSport = getMemberSportInfo(member);
    return memberSport?.isPrincipal ? "Principal" : "Secundaria";
  };

  const getTypeBadgeClass = (member: Member) => {
    const memberSport = getMemberSportInfo(member);
    if (memberSport?.isPrincipal) {
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
    return "bg-blue-100 text-blue-800 border-blue-200";
  };

  if (members.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay socios registrados
        </h3>
        <p className="text-gray-500">
          {selectedMemberType === "all" 
            ? `No hay socios practicando ${sport.name}`
            : selectedMemberType === "primary"
            ? `No hay socios con ${sport.name} como disciplina principal`
            : `No hay socios con ${sport.name} como disciplina secundaria`
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {currentMembers.map((member) => (
          <div key={member.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-[#FFD700] rounded-full flex items-center justify-center mr-3">
                  <User className="h-5 w-5 text-black" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {member.name} {member.second_name}
                  </h3>
                  <p className="text-sm text-gray-500">DNI: {member.dni}</p>
                </div>
              </div>
              {getTypeIcon(member)}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tipo:</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTypeBadgeClass(member)}`}>
                  {getTypeText(member)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cuota:</span>
                <span className="text-sm font-medium text-gray-900">
                  {getMemberSportInfo(member)?.quoteName || "No asignada"}
                </span>
              </div>

              {member.email && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500 truncate">{member.email}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {members.length > membersPerPage && (
        <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg">
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
                <span className="font-medium">{indexOfFirstMember + 1}</span> a{" "}
                <span className="font-medium">
                  {Math.min(indexOfLastMember, members.length)}
                </span>{" "}
                de <span className="font-medium">{members.length}</span> socios
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-500 hover:bg-gray-50"
                  }`}
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