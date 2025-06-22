import React, { useState } from "react";
import { ArrowLeft, Trophy } from "lucide-react";
import type { Sport, Member } from "../../../types";
import { SportInfoCard } from "../../cards/sports/SportInfoCard";
import { SportMembersCard } from "../../cards/sports/SportMembersCard";
import { SportQuotesCard } from "../../cards/sports/SportQuotesCard";
import { SportStatsCard } from "../../cards/sports/SportStatsCard"

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
  const [selectedMemberType, setSelectedMemberType] = useState<"all" | "primary" | "secondary">("all");

  // Filter members who practice this sport
  const sportMembers = members.filter(member => 
    member.sports?.some(s => s.id === sport.id)
  );

  // Separate primary and secondary members
  const primaryMembers = sportMembers.filter(member =>
    member.sports?.some(s => s.id == sport.id && s.isPrincipal == true)
  );

  const secondaryMembers = sportMembers.filter(member =>
    member.sports?.some(s => s.id == sport.id && s.isPrincipal == false)
  );

  console.log("members", sportMembers);
  console.log("primaryMembers", primaryMembers);
  console.log("secondaryMembers", secondaryMembers);

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
    <div className="fixed inset-0 bg-gray-100 overflow-y-auto z-50">
      {/* Header */}
      <div className="bg-[#1a1a1a] p-4 sticky top-0 z-10">
        <div className="flex items-center">
          <button
            onClick={onClose}
            className="text-[#FFD700] hover:text-[#FFC000] mr-4 transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div className="flex items-center">
            <Trophy className="h-6 w-6 text-[#FFD700] mr-2" />
            <h1 className="text-2xl font-bold text-[#FFD700]">
              Detalles de {sport.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="w-full mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Sport Information Card */}
          <SportInfoCard sport={sport} />

          {/* Statistics Card */}
          <SportStatsCard 
            sport={sport}
            sportMemberCounts={sportMemberCounts}
            totalMembers={sportMembers.length}
          />

          {/* Quotes Card */}
          <SportQuotesCard sport={sport} />
        </div>

        {/* Members Section - Full Width */}
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
  );
};