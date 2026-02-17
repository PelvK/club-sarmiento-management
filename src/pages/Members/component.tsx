import React, { useState, useMemo } from "react";
import { PlusCircle } from "lucide-react";
import { useMembers, usePayments, useSports } from "../../hooks";
import {
  FiltersType,
  MemberFilter,
} from "../../components/filters/MemberFilter";
import { MemberList } from "../../components/lists/member";
import { AppButton } from "../../components/common/AppButton/component";
import { Member } from "../../lib/types/member";
import { filterMembers } from "../../components/filters/MemberFilter/utils";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import "./styles.css";
import { EditMemberModal } from "../../components/modals/members/editMember";
import { MemberDetailsModal } from "../../components/modals/members/MemberDetailsModal";
import { AddMemberModal } from "../../components/modals/members/addMember";
import { MemberFormData } from "../../components/modals/members/types";
import { CONSOLE_LOG } from "../../lib/utils/consts";
import { useErrorHandler } from "../../hooks/useErrorHandler";
import { ConfirmationModal } from "../../components/modals/common/confirmationModal/component";
import { ErrorModal } from "../../components/modals/common/ErrorModal";

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
    deleteMember,
    updateMember,
    createMember,
    toggleMemberActive,
    refreshMembers,
  } = useMembers();
  const { sportSimple } = useSports();
  const { /* payments */ markAsPaid, cancelPayment } = usePayments();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberForDetails, setMemberForDetails] = useState<Member | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filters, setFilters] = useState<FiltersType>(filterInitialState);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { error, isErrorModalOpen, handleError, closeErrorModal } =
    useErrorHandler();

  const handleFilterChange = (name: keyof FiltersType, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (member: Member) => {
    if (CONSOLE_LOG) {
      console.log("Editing member:", member);
    }
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

  const handleDelete = async (id: number) => {
    setPendingDelete(id);
    setShowConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;

    setIsDeleting(true);

    try {
      await deleteMember(pendingDelete);
      setShowConfirmation(false);
    } catch (error) {
      setShowConfirmation(false);
      setPendingDelete(null);
      setTimeout(() => {
        handleError(error);
      }, 100);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveMember = async (member: Member) => {
    if (CONSOLE_LOG) {
      console.log("Saving member:", member);
    }
    await updateMember(member);
    await refreshMembers();
    setSelectedMember(null);
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      await toggleMemberActive(id, isActive);
      await refreshMembers();
    } catch (err) {
      console.error("Error toggling user status:", err);
    }
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

  return (
    <div>
      <div className="member-container">
        <div className="disciplines-hero-section">
          <div className="disciplines-hero-header">
            <div className="disciplines-hero-info">
              <h1 className="disciplines-hero-title">Socios</h1>
              <p className="disciplines-hero-subtitle">
                Gestiona todos los socios del club
              </p>
            </div>
            <div className="disciplines-action-buttons">
              <AppButton
                onClick={() => setShowAddModal(true)}
                label="Agregar Socio"
                startIcon={<PlusCircle className="w-5 h-5 mr-2" />}
              />
              {/*               {user?.is_admin && (
                <AppButton
                  variant="secondary"
                  label="Socios sin configurar"
                  startIcon={<MessageCircleWarning className="w-5 h-5 mr-2" />}
                  onClick={() => {
                    alert("No implementado aún");
                  }}
                />
              )} */}
            </div>
          </div>
          {/*         {SHOW_STATS && (
        )} */}
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
        onDelete={(id) => handleDelete(id)}
        onToggleActive={handleToggleActive}
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
          familyMembers={members.filter(
            (m) => m.familyHeadId === memberForDetails.id,
          )}
          familyHead={
            members.find((m) => m.id === memberForDetails.familyHeadId) || null
          }
          onMarkAsPaid={markAsPaid}
          onCancelPayment={cancelPayment}
        />
      )}

      <AddMemberModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleCreateMember}
      />
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => {
          setShowConfirmation(false);
          setPendingDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="¿Confirmar eliminación de socio?"
        message={`¿Estás seguro de que deseas crear el socio DNI: ${pendingDelete}?`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        type="warning"
        isLoading={isDeleting}
      />

      {error && (
        <ErrorModal
          isOpen={isErrorModalOpen}
          onClose={closeErrorModal}
          error={error}
          showDetails={process.env.NODE_ENV === "development"}
        />
      )}
    </div>
  );
};

export { Members };
