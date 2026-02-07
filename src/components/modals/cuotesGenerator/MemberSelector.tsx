import React from "react";
import { Users } from "lucide-react";
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
    <section>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-[#1a1a1a]" />
        Selección de Socios
      </h3>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <label
            className="flex items-center gap-2 cursor-pointer p-3 border-2 rounded-lg transition-colors hover:bg-gray-50"
            style={{
              borderColor: memberSelection === "all" ? "#1a1a1a" : "#e5e7eb",
              backgroundColor: memberSelection === "all" ? "#f9fafb" : "white",
            }}
          >
            <input
              type="radio"
              checked={memberSelection === "all"}
              onChange={() => onMemberSelectionChange("all")}
              className="w-4 h-4 text-[#1a1a1a] focus:ring-[#1a1a1a]"
            />
            <span className="text-sm font-medium text-gray-700">
              Todos los socios
            </span>
          </label>

          <label
            className="flex items-center gap-2 cursor-pointer p-3 border-2 rounded-lg transition-colors hover:bg-gray-50"
            style={{
              borderColor:
                memberSelection === "by-sport" ? "#1a1a1a" : "#e5e7eb",
              backgroundColor:
                memberSelection === "by-sport" ? "#f9fafb" : "white",
            }}
          >
            <input
              type="radio"
              checked={memberSelection === "by-sport"}
              onChange={() => onMemberSelectionChange("by-sport")}
              className="w-4 h-4 text-[#1a1a1a] focus:ring-[#1a1a1a]"
            />
            <span className="text-sm font-medium text-gray-700">
              Por disciplina
            </span>
          </label>

          <label
            className="flex items-center gap-2 cursor-pointer p-3 border-2 rounded-lg transition-colors hover:bg-gray-50"
            style={{
              borderColor:
                memberSelection === "individual" ? "#1a1a1a" : "#e5e7eb",
              backgroundColor:
                memberSelection === "individual" ? "#f9fafb" : "white",
            }}
          >
            <input
              type="radio"
              checked={memberSelection === "individual"}
              onChange={() => onMemberSelectionChange("individual")}
              className="w-4 h-4 text-[#1a1a1a] focus:ring-[#1a1a1a]"
            />
            <span className="text-sm font-medium text-gray-700">
              Selección individual
            </span>
          </label>
        </div>

        {memberSelection === "by-sport" && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Seleccione las disciplinas
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sports.map((sport) => (
                <label
                  key={sport.id}
                  className="flex items-center gap-2 cursor-pointer p-3 border border-gray-200 rounded-md hover:bg-white transition-colors bg-white"
                >
                  <input
                    type="checkbox"
                    checked={config.selectedSports.includes(sport.id)}
                    onChange={() => handleSportToggle(sport.id)}
                    className="w-4 h-4 text-[#1a1a1a] focus:ring-[#1a1a1a]"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {sport.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {memberSelection === "individual" && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Seleccione los socios
            </label>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {members.map((member) => (
                <label
                  key={member.id}
                  className="flex items-center gap-2 cursor-pointer p-3 border border-gray-200 rounded-md hover:bg-white transition-colors bg-white"
                >
                  <input
                    type="checkbox"
                    checked={config.selectedMembers.includes(member.id)}
                    onChange={() => handleMemberToggle(member.id)}
                    className="w-4 h-4 text-[#1a1a1a] focus:ring-[#1a1a1a]"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {member.name} {member.second_name}
                  </span>
                  <span className="text-xs text-gray-500 ml-auto">
                    DNI: {member.dni}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
