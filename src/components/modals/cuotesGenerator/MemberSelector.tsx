import React, { useState, useMemo } from "react";
import { Users, Search, X } from "lucide-react";
import { Member } from "../../../lib/types/member";
import { Sport } from "../../../lib/types/sport";
import { GenerationConfig } from "../../../lib/types/quote";

interface MemberSelectorProps {
  memberSelection: "all" | "by-sport" | "individual";
  onMemberSelectionChange: (type: "all" | "by-sport" | "individual") => void;
  config: GenerationConfig;
  onConfigChange: (config: GenerationConfig) => void;
  members: Member[];
  sports: Sport[];
}

export const MemberSelector: React.FC<MemberSelectorProps> = ({
  memberSelection,
  onMemberSelectionChange,
  config,
  onConfigChange,
  members,
  sports,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMembers = useMemo(() => {
    if (!searchTerm.trim()) return members;

    const search = searchTerm.toLowerCase().trim();
    return members.filter((member) => {
      const fullName = `${member.name} ${member.second_name}`.toLowerCase();
      const dni = member.dni.toLowerCase();
      return fullName.includes(search) || dni.includes(search);
    });
  }, [members, searchTerm]);

  const handleSportToggle = (sportId: number) => {
    onConfigChange({
      ...config,
      selectedSports: config.selectedSports.includes(sportId)
        ? config.selectedSports.filter((id) => id !== sportId)
        : [...config.selectedSports, sportId],
    });
  };

  const handleMemberToggle = (memberId: number) => {
    onConfigChange({
      ...config,
      selectedMembers: config.selectedMembers.includes(memberId)
        ? config.selectedMembers.filter((id) => id !== memberId)
        : [...config.selectedMembers, memberId],
    });
  };

  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
        <Users className="w-5 h-5 text-[#FFD700]" />
        Selección de Socios
      </h3>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => onMemberSelectionChange("all")}
            className={`relative p-4 rounded-lg border-2 transition-all duration-200 text-left ${
              memberSelection === "all"
                ? "border-[#FFD700] bg-gradient-to-br from-yellow-50 to-orange-50 shadow-md"
                : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`font-semibold text-sm ${
                memberSelection === "all" ? "text-gray-900" : "text-gray-700"
              }`}>
                Todos los socios
              </span>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  memberSelection === "all"
                    ? "border-[#FFD700] bg-[#FFD700]"
                    : "border-gray-300 bg-white"
                }`}
              >
                {memberSelection === "all" && (
                  <div className="w-2 h-2 rounded-full bg-[#1a1a1a]" />
                )}
              </div>
            </div>
            <p className="text-xs text-gray-600">Generar cuotas para todos los socios activos</p>
          </button>

          <button
            onClick={() => onMemberSelectionChange("by-sport")}
            className={`relative p-4 rounded-lg border-2 transition-all duration-200 text-left ${
              memberSelection === "by-sport"
                ? "border-[#FFD700] bg-gradient-to-br from-yellow-50 to-orange-50 shadow-md"
                : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`font-semibold text-sm ${
                memberSelection === "by-sport" ? "text-gray-900" : "text-gray-700"
              }`}>
                Por disciplina
              </span>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  memberSelection === "by-sport"
                    ? "border-[#FFD700] bg-[#FFD700]"
                    : "border-gray-300 bg-white"
                }`}
              >
                {memberSelection === "by-sport" && (
                  <div className="w-2 h-2 rounded-full bg-[#1a1a1a]" />
                )}
              </div>
            </div>
            <p className="text-xs text-gray-600">Filtrar por disciplinas específicas</p>
          </button>

          <button
            onClick={() => onMemberSelectionChange("individual")}
            className={`relative p-4 rounded-lg border-2 transition-all duration-200 text-left ${
              memberSelection === "individual"
                ? "border-[#FFD700] bg-gradient-to-br from-yellow-50 to-orange-50 shadow-md"
                : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`font-semibold text-sm ${
                memberSelection === "individual" ? "text-gray-900" : "text-gray-700"
              }`}>
                Selección individual
              </span>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  memberSelection === "individual"
                    ? "border-[#FFD700] bg-[#FFD700]"
                    : "border-gray-300 bg-white"
                }`}
              >
                {memberSelection === "individual" && (
                  <div className="w-2 h-2 rounded-full bg-[#1a1a1a]" />
                )}
              </div>
            </div>
            <p className="text-xs text-gray-600">Seleccionar socios manualmente</p>
          </button>
        </div>

        {memberSelection === "by-sport" && (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-5 border-2 border-gray-200">
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Seleccione las disciplinas
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sports.map((sport) => (
                <label
                  key={sport.id}
                  className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all duration-200 border-2 ${
                    config.selectedSports.includes(sport.id)
                      ? "bg-[#FFD700]/10 border-[#FFD700] shadow-sm"
                      : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  <div
                    className={`relative w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      config.selectedSports.includes(sport.id)
                        ? "bg-[#FFD700] border-[#FFD700]"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    {config.selectedSports.includes(sport.id) && (
                      <svg className="w-3 h-3 text-[#1a1a1a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    checked={config.selectedSports.includes(sport.id)}
                    onChange={() => handleSportToggle(sport.id)}
                    className="hidden"
                  />
                  <span className={`text-sm font-medium ${
                    config.selectedSports.includes(sport.id) ? "text-gray-900" : "text-gray-700"
                  }`}>
                    {sport.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {memberSelection === "individual" && (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-5 border-2 border-gray-200">
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Seleccione los socios
            </label>

            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre o DNI..."
                  className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-gray-600">
                  {filteredMembers.length} {filteredMembers.length === 1 ? "socio encontrado" : "socios encontrados"}
                </span>
                {config.selectedMembers.length > 0 && (
                  <span className="text-[#1a1a1a] font-semibold">
                    {config.selectedMembers.length} seleccionados
                  </span>
                )}
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-2" style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#d1d5db #f3f4f6"
            }}>
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <label
                    key={member.id}
                    className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all duration-200 border-2 ${
                      config.selectedMembers.includes(member.id)
                        ? "bg-[#FFD700]/10 border-[#FFD700] shadow-sm"
                        : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <div
                      className={`relative w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                        config.selectedMembers.includes(member.id)
                          ? "bg-[#FFD700] border-[#FFD700]"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      {config.selectedMembers.includes(member.id) && (
                        <svg className="w-3 h-3 text-[#1a1a1a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={config.selectedMembers.includes(member.id)}
                      onChange={() => handleMemberToggle(member.id)}
                      className="hidden"
                    />
                    <div className="flex-1 flex items-center justify-between">
                      <span className={`text-sm font-medium ${
                        config.selectedMembers.includes(member.id) ? "text-gray-900" : "text-gray-700"
                      }`}>
                        {member.name} {member.second_name}
                      </span>
                      <span className="text-xs text-gray-500 font-mono">
                        DNI: {member.dni}
                      </span>
                    </div>
                  </label>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No se encontraron socios</p>
                  <p className="text-xs mt-1">Intenta con otro término de búsqueda</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
