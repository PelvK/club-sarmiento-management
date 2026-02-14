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
import "./styles.css";

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
    null,
  );
  const [shouldRender, setShouldRender] = useState(isOpen);
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
        })),
      );
    },
    
    [selectedFamilyHead],
  );

  const handleFamilyHeadSelect = (head: Member) => {
    console.log("Selected family head: ", head);
    setSelectedFamilyHead(head);
    setFormData((prev: MemberFormData) => ({ ...prev, familyHeadId: head.id }));

    console.log("Head sports: ", head.sports);
    const headPrimarySport = head.sports?.filter(
      (sport) => sport.isPrincipal == true,
    );
    console.log("Head primary sport: ", headPrimarySport);
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
        (sport) => sport.isPrincipal == true,
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
      (s) => s.quoteId === undefined,
    );

    if (sportsWithoutQuotes.length > 0) {
      alert(
        "Todas las disciplinas seleccionadas deben tener una cuota asociada",
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
        sport.id === sportId ? { ...sport, quoteId: quoteId } : sport,
      ),
    );
  };

  const isSportSelected = (sportId: number) =>
    selectedSports.some((s) => s.id === sportId);

  const isPrimarySport = (sportId: number) =>
    selectedSports.some((s) => s.id === sportId && s.isPrincipal);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {
      const timeout = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div className={`modal-overlay ${isOpen ? "fade-in" : "fade-out"}`}>
      <div className={`modal-content ${isOpen ? "scale-in" : "scale-out"}`}>
        <div className="modal-header">
          <h2 className="modal-title">Agregar Nuevo Socio</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <PersonalInfoSection formData={formData} setFormData={setFormData} />
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

          <div className="section-card">
            <div className="section-header">
              <Trophy className="section-icon" />
              <h3 className="section-title">Disciplinas</h3>
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
          </div>

          <div className="action-add-modal-button">
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
