import React, { useState } from "react";
import { X, Trophy } from "lucide-react";
import { SportInfoCard } from "../../cards/sports/SportInfoCard";
import { SportMembersCard } from "../../cards/sports/SportMembersCard";
import { SportQuotesCard } from "../../cards/sports/SportQuotesCard";
import { SportStatsCard } from "../../cards/sports/SportStatsCard";
import { Sport } from "../../../lib/types/sport";
import { Member } from "../../../lib/types/member";
import { CONSOLE_LOG } from "../../../lib/utils/consts";

interface SportDetailsModalProps {
  sport: Sport;
  onClose: () => void;
  members: Member[];
  sportMemberCounts: { primary: number; secondary: number };
}

export const SportDetailsModal: React.FC<SportDetailsModalProps> = ({
  sport,
  onClose,
  members,
  sportMemberCounts,
}) => {
  const [selectedMemberType, setSelectedMemberType] = useState<
    "all" | "primary" | "secondary"
  >("all");

  const sportMembers = members.filter((member) =>
    member.sports?.some((s) => s.id === sport.id),
  );

  const primaryMembers = sportMembers.filter((member) =>
    member.sports?.some((s) => s.id == sport.id && s.isPrincipal == true),
  );

  const secondaryMembers = sportMembers.filter((member) =>
    member.sports?.some((s) => s.id == sport.id && s.isPrincipal == false),
  );

  if (CONSOLE_LOG) {
    console.log("members", sportMembers);
    console.log("primaryMembers", primaryMembers);
    console.log("secondaryMembers", secondaryMembers);
  }

  const getFilteredMembers = () => {
    switch (selectedMemberType) {
      case "primary":
        return primaryMembers;
      case "secondary":
        return secondaryMembers;
      default:
        return sportMembers;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-lg shadow-xl overflow-hidden flex flex-col">
        <div className="bg-white border-b border-gray-200 p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Trophy className="h-7 w-7 text-[#1a1a1a] mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                Detalles de {sport.name}
              </h1>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="w-full p-6 bg-gray-50 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <SportInfoCard sport={sport} />
            <SportStatsCard
              sport={sport}
              sportMemberCounts={sportMemberCounts}
              totalMembers={sportMembers.length}
            />
            <SportQuotesCard sport={sport} />
          </div>

          <SportMembersCard
            sport={sport}
            quotes={sport.quotes}
            members={getFilteredMembers()}
            primaryMembers={primaryMembers}
            secondaryMembers={secondaryMembers}
            selectedMemberType={selectedMemberType}
            onMemberTypeChange={setSelectedMemberType}
          />
        </div>
      </div>
    </div>
  );
};
