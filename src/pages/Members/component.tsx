import React, { useState, useMemo } from "react";
import { PlusCircle, MessageCircleWarning } from "lucide-react";
import { useAuth, useMembers, usePayments, useSports } from "../../hooks";
import { ErrorMessage } from "../../components/ErrorMessage";
import {
  FiltersType,
  MemberFilter,
} from "../../components/filters/MemberFilter";
import { MemberList } from "../../components/lists/MemberList";
import { AppButton } from "../../components/common/AppButton/component";
import { Member } from "../../lib/types/member";
import { filterMembers } from "../../components/filters/MemberFilter/utils";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import "./styles.css";
import { AppText } from "../../components/common/AppText/component";
import { EditMemberModal } from "../../components/modals/members/editMember";
import { MemberDetailsModal } from "../../components/modals/members/MemberDetailsModal";
import { AddMemberModal } from "../../components/modals/members/addMember";
import { MemberFormData } from "../../components/modals/members/types";

const filterInitialState: FiltersType = {
  name: "",
  second_name: "",
  dni: "",
  sport: "All",
};

const Members: React.FC = () => {
  const {
    members,
    loading,
    error,
    deleteMember,
    updateMember,
    createMember,
    refreshMembers,
  } = useMembers();
  const { sportSimple } = useSports();
  const { user } = useAuth();
  const { payments } = usePayments();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberForDetails, setMemberForDetails] = useState<Member | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filters, setFilters] = useState<FiltersType>(filterInitialState);

  const handleFilterChange = (name: keyof FiltersType, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (member: Member) => {
    console.log("Editing member:", member);
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
    console.log("Saving member:", member);
    await updateMember(member);
    await refreshMembers();
    setSelectedMember(null);
  };

  const handleCreateMember = async (member: MemberFormData) => {
    await createMember(member);
    await refreshMembers();
    setShowAddModal(false);
  };

  const filteredMembers = useMemo(() => {
    if (!members) return [];
    return filterMembers(members, filters);
  }, [members, filters]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <div className="member-container">
        <AppText.H2>Socios</AppText.H2>
        <div className="action-buttons">
          <AppButton
            onClick={() => setShowAddModal(true)}
            label="Agregar Socio"
            startIcon={<PlusCircle className="w-5 h-5 mr-2" />}
          />
          {user?.is_admin && (
            <AppButton
              variant="secondary"
              label="Socios sin configurar"
              startIcon={<MessageCircleWarning className="w-5 h-5 mr-2" />}
              onClick={() => {
                /**
                 * @TODO ver como implementar esta funcionalidad
                 */
                alert("Socios sin configurar clicked");
              }}
            />
          )}
        </div>
      </div>

      <MemberFilter
        filters={filters}
        onFilterChange={handleFilterChange}
        sports={sportSimple}
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
          payments={payments.filter((p) => p.member.id === memberForDetails.id)}
          familyMembers={members.filter(
            (m) => m.familyHeadId === memberForDetails.id,
          )}
          familyHead={
            members.find((m) => m.id === memberForDetails.familyHeadId) || null
          }
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

export { Members };
