import React, { useState, useEffect, useCallback } from "react";
import { Trophy } from "lucide-react";
import { useMembers } from "../../../../hooks";
import { Member, SportSelection, Quote } from "../../../../lib/types";
import { FAMILY_STATUS } from "../../../../lib/enums/SportSelection";
import { SearchFamilyHeadModal } from "../SearchFamilyHeadModal";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { EditMemberModalProps, MemberFormData } from "../types";
import { SocietyQuoteSection } from "./SocietyQuoteSection";
import { FamilyGroupSection } from "./FamilyGroupSection";
import { DisciplineSection } from "./DisciplineSection";
import { AppButton } from "../../../common/AppButton/component";

export const EditMemberModal: React.FC<EditMemberModalProps> = ({
  member,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<MemberFormData>({
    name: "",
    second_name: "",
    email: "",
    phone_number: "",
    dni: "",
    birthdate: "",
    familyGroupStatus: FAMILY_STATUS.NONE,
    familyHeadId: undefined,
  });
  const [selectedSports, setSelectedSports] = useState<SportSelection[]>([]);
  const [selectedSocietaryCuote, setSelectedSocietaryCuote] =
    useState<Quote | null>(null);
  const [showFamilyHeadSearch, setShowFamilyHeadSearch] = useState(false);
  const [selectedFamilyHead, setSelectedFamilyHead] = useState<Member | null>(
    null
  );
  const { familyHeads } = useMembers();

  useEffect(() => {
    if (member) {
      setFormData({
        id: member.id,
        name: member.name,
        second_name: member.second_name,
        email: member.email,
        phone_number: member.phone_number,
        dni: member.dni,
        birthdate: member.birthdate,
        familyGroupStatus: member.familyGroupStatus || FAMILY_STATUS.NONE,
        familyHeadId: member.familyHeadId || undefined,
      });

      if (member.sports) {
        const sportsSelection = member.sports.map((sport) => ({
          id: sport.id,
          isPrincipal: sport.isPrincipal || false,
          quoteId: sport.quotes![0].id,
        }));
        setSelectedSports(sportsSelection);
      }
      if (member.societary_cuote) {
        setSelectedSocietaryCuote(member.societary_cuote);
      }

      if (member.familyHeadId) {
        const familyHead = familyHeads.find(
          (h) => h.id === member.familyHeadId
        );
        if (familyHead) {
          setSelectedFamilyHead(familyHead);
        }
      }
    }
  }, [member, familyHeads]);

  const handleSportChange = (ID: number, checked: boolean) => {
    if (checked) {
      const isPrincipal = selectedSports.length === 0 && !selectedFamilyHead;
      setSelectedSports((prev) => [
        ...prev,
        {
          id: ID,
          isPrincipal: isPrincipal,
        },
      ]);
    } else {
      if (selectedFamilyHead && isPrincipalSport(ID)) {
        return;
      }

      setSelectedSports((prev) => {
        const filtered = prev.filter((s) => s.id !== ID);
        if (
          filtered.length > 0 &&
          !filtered.some((s) => s.isPrincipal) &&
          !selectedFamilyHead
        ) {
          filtered[0].isPrincipal = true;
        }
        return filtered;
      });
    }
  };

  const setPrimarySport = useCallback((ID: number) => {
    if (selectedFamilyHead) return;

    setSelectedSports((prev) =>
      prev.map((sport) => ({
        ...sport,
        isPrimary: sport.id === ID,
      }))
    );
  }, [selectedFamilyHead]);

  const handleFamilyHeadSelect = (head: Member) => {
    setSelectedFamilyHead(head);
    setFormData((prev) => ({ ...prev, familyHeadId: head.id }));

    const headPrimarySport = head.sports?.filter(
      (sport) => sport.isPrincipal == true
    );
    if (headPrimarySport) {
      setSelectedSports((prev) => {
        const existingSport = prev.find((s) => s.id === headPrimarySport[0].id);
        if (!existingSport) {
          return [
            ...prev.map((s) => ({ ...s, isPrincipal: false })),
            { id: headPrimarySport[0].id, isPrincipal: true },
          ];
        }
        return prev.map((s) => ({
          ...s,
          isPrincipal: s.id === headPrimarySport[0].id,
        }));
      });
    }
    setShowFamilyHeadSearch(false);
  };

  useEffect(() => {
    if (
      formData.familyHeadId &&
      formData.familyGroupStatus != FAMILY_STATUS.HEAD &&
      selectedFamilyHead
    ) {
      const headSport = selectedFamilyHead.sports?.filter(
        (sport) => sport.isPrincipal == true
      );

      if (headSport && selectedSports.some((s) => s.id === headSport[0].id)) {
        setPrimarySport(headSport[0].id);
      }
    }
  }, [
    formData.familyHeadId,
    formData.familyGroupStatus,
    selectedFamilyHead,
    selectedSports,
    selectedSocietaryCuote,
    setPrimarySport,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!member) return;

    const principalSport = selectedSports.find((s) => s.isPrincipal);

    if (!principalSport) {
      alert("Por favor, seleccione una disciplina principal");
      return;
    }

    const sportsWithoutQuotes = selectedSports.filter(
      (s) => s.quoteId === undefined
    );

    if (sportsWithoutQuotes.length > 0) {
      alert(
        "Todas las disciplinas seleccionadas deben tener una cuota asociada"
      );
      return;
    }

    if (
      formData.familyGroupStatus == FAMILY_STATUS.MEMBER &&
      !selectedFamilyHead
    ) {
      alert("Si seleciona miembro, debe tener un jefe seleccionado");
      return;
    }

    if (selectedSports.length === 0) {
      alert("Por favor, seleccione al menos una disciplina");
      return;
    }

    if (selectedSocietaryCuote === null) {
      alert("Por favor, debe seleccionar una cuota societaria");
      return;
    }

    await onSave({
      ...member,
      ...formData,
      sports_submit: selectedSports,
      societary_cuote: selectedSocietaryCuote,
    } as Member);

    onClose();
  };

  const handleQuoteSelection = (sportId: number, quoteId: number) => {
    setSelectedSports((prev) =>
      prev.map((sport) =>
        sport.id === sportId ? { ...sport, quoteId: quoteId } : sport
      )
    );
  };

  const isPrincipalSport = (sportId: number) =>
    selectedSports.some((s) => s.id === sportId && s.isPrincipal == true);

  if (!member) return null;

  return (
    <div
      className={`fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 max-h-[80vh] overflow-y-auto transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Editar Socio</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <PersonalInfoSection formData={formData} setFormData={setFormData} />

          <SocietyQuoteSection
            selectedSocietaryCuote={selectedSocietaryCuote}
            setSelectedSocietaryCuote={setSelectedSocietaryCuote}
          />

          <FamilyGroupSection
            formData={formData}
            setFormData={setFormData}
            selectedFamilyHead={selectedFamilyHead}
            setSelectedFamilyHead={setSelectedFamilyHead}
            setShowFamilyHeadSearch={setShowFamilyHeadSearch}
          />

          <div className="flex items-center mb-4">
            <Trophy className="h-5 w-5 text-[#FFD700] mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Disciplinas</h3>
          </div>

          <DisciplineSection
            selectedSports={selectedSports}
            handleSportChange={handleSportChange}
            handleQuoteSelection={handleQuoteSelection}
            selectedFamilyHead={selectedFamilyHead}
            setPrimarySport={setPrimarySport}
          />

          <div className="flex justify-end space-x-3 pt-4">

            
            <AppButton
              type="button"
              variant="secondary"
              onClick={() => {
                onClose();
                setSelectedFamilyHead(null);
                setSelectedSocietaryCuote(null);
                setSelectedSports([]);
                setFormData({});
              }}
              label="Cancelar"
            />
            <AppButton type="submit" variant="primary" label="Guardar Cambios" />
          </div>
        </form>
      </div>

      {showFamilyHeadSearch && (
        <SearchFamilyHeadModal
          onClose={() => setShowFamilyHeadSearch(false)}
          onSelect={handleFamilyHeadSelect}
          familyHeads={familyHeads}
        />
      )}
    </div>
  );
};
