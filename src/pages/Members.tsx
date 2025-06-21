import React, { useState, useMemo } from "react";
import { PlusCircle, MessageCircleWarning } from "lucide-react";
import { useMembers } from "../hooks/useMembers";
import { usePayments } from "../hooks/usePayments";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";
import { MemberFilters } from "../components/MemberFilters";
import { MemberDetailsModal } from "../components/modals/members/MemberDetailsModal";
import { AddMemberModal } from "../components/modals/members/AddMemberModal";
import type { Member } from "../types";
import { MemberList } from "../components/lists/MemberList";
import { useSports } from "../hooks/useSports";
import { EditMemberModal } from "../components/modals/members/EditMemberModal";

const Members: React.FC = () => {
  const { members, loading, error, deleteMember, updateMember, createMember, refreshMembers } =
    useMembers();
  const { sportSimple } = useSports();
  const { payments } = usePayments();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberForDetails, setMemberForDetails] = useState<Member | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    second_name: "",
    dni: "",
    sport: "All",
  });

  console.log("HOLA", Date.now());

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

   const handleEditClick = (member: Member) => {
    setSelectedMember(member);
    setShowEditModal(true);
  };

  const handleDetailsClick = (member: Member) => {
    setMemberForDetails(member);
  };

  const handleCloseModal = () => {
    setSelectedMember(null);
    setShowEditModal(false);
  };

  const handleCloseDetails = () => {
    setMemberForDetails(null);
    handleCloseModal();
  };

  const handleSaveMember = async (member: Member) => {
    console.log("A UPDATEAR", member);
    await updateMember(member);
    await refreshMembers();
    setSelectedMember(null);
  };

  const handleCreateMember = async (member: Omit<Member, "id">) => {
    await createMember(member);
    await refreshMembers();
    setShowAddModal(false);
  };

  const filteredMembers = useMemo(() => {
    return members!.filter((member) => {
      const nameMatch = member.name
        .toLowerCase()
        .includes(filters.name.toLowerCase());

      const secondNameMatch = member.second_name
        .toLowerCase()
        .includes(filters.name.toLocaleLowerCase());

      const dniMatch = member.dni
        .toLowerCase()
        .includes(filters.dni.toLowerCase());

      const sportMatch =
        filters.sport == "All"
          ? true
          : filters.sport == "None"
          ? member.sports?.length == 0
          : member.sports?.map((s) => s.name).includes(filters.sport);

      return (nameMatch || secondNameMatch) && dniMatch && sportMatch;
    });
  }, [members, filters]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Socios</h1>
        <div className="flex flex-row">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center mx-4 px-4 py-2 bg-[#FFD700] text-black rounded-md hover:bg-[#FFC000] transition-colors"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Agregar Socio
          </button>
          <button className="flex items-center px-4 py-2 text-black rounded-md hover:bg-[#FFC000] transition-colors">
            <MessageCircleWarning className="w-5 h-5 mr-2" />
            Socios sin configurar
          </button>
        </div>
      </div>

      <MemberFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        sports={sportSimple || []}
      />

      <MemberList
        members={filteredMembers}
        onEdit={handleEditClick}
        onDelete={(id) => deleteMember(id)}
        onDetails={handleDetailsClick}
      />

      {selectedMember && (
        <EditMemberModal
          member={selectedMember}
          isOpen={showEditModal}
          onClose={handleCloseModal}
          onSave={handleSaveMember}
        />
      )}
      
      {memberForDetails && (
        <MemberDetailsModal
          member={memberForDetails}
          onClose={handleCloseDetails}
          payments={payments.filter((p) => p.memberId === memberForDetails.id)}
          familyMembers={members.filter((m) => m.familyHeadId === memberForDetails.id)}
          familyHead={members.find((m) => m.id === memberForDetails.familyHeadId) || null}
        />
      )}

      <AddMemberModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleCreateMember}
      />
    </div>
  );
};

export default Members;
