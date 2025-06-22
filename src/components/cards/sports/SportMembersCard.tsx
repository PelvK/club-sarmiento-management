import React, { useEffect, useState } from "react";
import { Users } from "lucide-react";
import type { Sport, Member, Quote } from "../../../types";
import { SportMembersList } from "../../lists/SportMemberList";
import { SportDetailFilters } from "../../filters/SportDetailFIlters";

interface SportMembersCardProps {
  sport: Sport;
  members: Member[];
  quotes: Quote[] | undefined;
  primaryMembers: Member[];
  secondaryMembers: Member[];
  selectedMemberType: "all" | "primary" | "secondary";
  onMemberTypeChange: (type: "all" | "primary" | "secondary") => void;
}

export const SportMembersCard: React.FC<SportMembersCardProps> = ({
  sport,
  members,
  primaryMembers,
  quotes,
  secondaryMembers,
  selectedMemberType,
  onMemberTypeChange,
}) => {
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>(members);
  const [filters, setFilters] = useState({
    name: "",
    second_name: "",
    dni: "",
  });

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuoteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    const quote = quotes?.find((q) => q.name == selectedName) || null;
    setSelectedQuote(quote);
  };

  useEffect(() => {
    const filtered = members.filter((member) => {
      const nameMatch = member.name
        .toLowerCase()
        .includes(filters.name.toLowerCase());
      const secondNameMatch = member.second_name
        .toLowerCase()
        .includes(filters.second_name.toLowerCase());
      const dniMatch = member.dni
        .toLowerCase()
        .includes(filters.dni.toLowerCase());
      return (
        nameMatch &&
        secondNameMatch &&
        dniMatch &&
        member.sports?.some((s) => s.id === sport.id)
      );
    });

    if (selectedQuote) {
      setFilteredMembers(
        filtered.filter((member) =>
          member.sports?.some((s) => s.quoteId == selectedQuote.id)
        )
      );
    } else {
      setFilteredMembers(filtered);
    }
  }, [selectedQuote, members, filters, sport.id]);

  const getFilterButtonClass = (type: "all" | "primary" | "secondary") => {
    const baseClass =
      "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200";
    const activeClass = "bg-[#FFD700] text-black shadow-md";
    const inactiveClass = "bg-gray-100 text-gray-600 hover:bg-gray-200";

    return `${baseClass} ${
      selectedMemberType === type ? activeClass : inactiveClass
    }`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col items-start justify-between mb-6">
        <div className="flex items-start">
          <Users className="h-6 w-6 text-[#FFD700] mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">
            Asociados a {sport.name}
          </h2>
        </div>

        {/* Filter Buttons */}
        <SportDetailFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onMemberTypeChange={onMemberTypeChange}
          getFilterButtonClass={getFilterButtonClass}
          members={members}
          primaryMembers={primaryMembers}
          secondaryMembers={secondaryMembers}
          quotes={quotes}
          selectedQuote={selectedQuote}
          handleQuoteChange={handleQuoteChange}
        />
      </div>

      {/* Members List */}
      <SportMembersList
        members={filteredMembers}
        sport={sport}
        selectedMemberType={selectedMemberType}
      />
    </div>
  );
};
