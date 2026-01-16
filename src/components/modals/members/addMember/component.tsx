import React, { useState, useEffect, useCallback } from "react";
import { Trophy } from "lucide-react";
import { SearchFamilyHeadModal } from "../SearchFamilyHeadModal";
import { useSports, useMembers } from "../../../../hooks";
import { FAMILY_STATUS } from "../../../../lib/enums/SportSelection";
import { SportSelection } from "../../../../lib/types/sport";
import { Member } from "../../../../lib/types/member";
import { Quote } from "../../../../lib/types/quote";
import { AppButton } from "../../../common/AppButton/component";
import { DisciplinesSection } from "./DisciplineSection";
import { MemberFormData, AddMemberModalProps } from "../types";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { FamilyGroupSection } from "./FamilyGroupSection";
import { SocietyQuoteSection } from "./SocietyQuoteSection";

const emptyForm: MemberFormData = {
  name: "",
  second_name: "",
  email: "",
  phone_number: "",
  dni: "",
  birthdate: new Date().toISOString().split("T")[0],
  familyGroupStatus: FAMILY_STATUS.NONE,
  familyHeadId: undefined,
};

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState(emptyForm);
  const [selectedSports, setSelectedSports] = useState<SportSelection[]>([]);
  const [selectedSocietaryCuote, setSelectedSocietaryCuote] =
    useState<Quote | null>(null);
  const [showFamilyHeadSearch, setShowFamilyHeadSearch] = useState(false);
  const [selectedFamilyHead, setSelectedFamilyHead] = useState<Member | null>(
    null
  );
  const { sports } = useSports();
  const { familyHeads } = useMembers();

  const handleSportChange = (ID: number, checked: boolean) => {
    if (checked) {
      const isPrincipal = selectedSports.length === 0 && !selectedFamilyHead;
      setSelectedSports((prev: SportSelection[]) => [
        ...prev,
        {
          id: ID,
          isPrincipal: isPrincipal,
        },
      ]);
    } else {
      if (selectedFamilyHead && isPrimarySport(ID)) {
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

  const setPrimarySport = useCallback(
    (ID: number) => {
      if (selectedFamilyHead) return;

      setSelectedSports((prev) =>
        prev.map((sport) => ({
          ...sport,
          isPrincipal: sport.id === ID,
        }))
      );
    },
    [selectedFamilyHead]
  );

  const handleFamilyHeadSelect = (head: Member) => {
    setSelectedFamilyHead(head);
    setFormData((prev: MemberFormData) => ({ ...prev, familyHeadId: head.id }));

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

  /**
   * @TODO ver si las dependencias del hook estan bien.
   */
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

    const primarySport = selectedSports.find((s) => s.isPrincipal);

    if (!primarySport && formData.familyGroupStatus != FAMILY_STATUS.NONE) {
      alert("Por favor, seleccione una disciplina principal");
      return;
    }

    if (!primarySport && selectedSports.length > 0) {
      console.log("error2: ", primarySport + " " + formData);
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

    if (
      selectedSports.length === 0 &&
      formData.familyGroupStatus != FAMILY_STATUS.NONE
    ) {
      alert("Por favor, seleccione al menos una disciplina");
      return;
    }

    if (selectedSocietaryCuote === null) {
      alert("Por favor, debe seleccionar una cuota societaria");
      return;
    }

    await onSave({
      ...formData,
      sports_submit: selectedSports,
      societary_cuote: selectedSocietaryCuote,
    });
    setSelectedSports([]);
    setSelectedFamilyHead(null);
    setSelectedSocietaryCuote(null);
    setFormData(emptyForm);
    onClose();
  };

  const handleQuoteSelection = (sportId: number, quoteId: number) => {
    setSelectedSports((prev) =>
      prev.map((sport) =>
        sport.id === sportId ? { ...sport, quoteId: quoteId } : sport
      )
    );
  };

  const isSportSelected = (sportId: number) =>
    selectedSports.some((s) => s.id === sportId);

  const isPrimarySport = (sportId: number) =>
    selectedSports.some((s) => s.id === sportId && s.isPrincipal);

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
        {" "}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Agregar Nuevo Socio
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <PersonalInfoSection
            formData={formData}
            setFormData={setFormData}
          />
          <SocietyQuoteSection
            selectedSocietaryCuote={selectedSocietaryCuote}
            setSelectedSocietaryCuote={setSelectedSocietaryCuote}
          />

          <FamilyGroupSection
            formData={formData}
            setFormData={setFormData}
            setShowFamilyHeadSearch={setShowFamilyHeadSearch}
            selectedFamilyHead={selectedFamilyHead}
            setSelectedFamilyHead={setSelectedFamilyHead}
          />

          {/* Sports Selection */}
          <div className="flex items-center mb-4">
            <Trophy className="h-5 w-5 text-[#FFD700] mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Disciplinas</h3>
          </div>

          <DisciplinesSection
            sports={sports}
            selectedFamilyHead={selectedFamilyHead}
            selectedSports={selectedSports}
            onSportChange={handleSportChange}
            onSetPrimarySport={setPrimarySport}
            isSportSelected={isSportSelected}
            isPrimarySport={isPrimarySport}
            onQuoteSelect={handleQuoteSelection}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <AppButton
              label="Cancelar"
              type="button"
              variant="secondary"
              onClick={onClose}
            />
            <AppButton label="Guardar" type="submit" variant="primary" />
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
