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
import "../addMember/styles.css";

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
    null,
  );
  const { familyHeads } = useMembers();
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    console.log("formData updated:", formData);
  }, [formData]);

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
          (h) => h.id === member.familyHeadId,
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

  const setPrimarySport = useCallback(
    (ID: number) => {
      console.log("setPrimarySport called with ID: ", ID);
      console.log("selectedFamilyHead: ", selectedFamilyHead);
      if (selectedFamilyHead) return;

      console.log("Setting primary sport to ID: ", ID);

      setSelectedSports((prev) => {
        console.log("Before update, selectedSports: ", prev);
        const updated = prev.map((sport) => ({
          ...sport,
          isPrincipal: sport.id === ID,
        }));
        console.log("After update, selectedSports: ", updated);
        return updated;
      });
    },
    [selectedFamilyHead],
  );

  const handleFamilyHeadSelect = (head: Member) => {
    setSelectedFamilyHead(head);
    setFormData((prev) => ({ ...prev, familyHeadId: head.id }));

    const headPrimarySport = head.sports?.find(
      (sport) => sport.isPrincipal === true,
    );
    if (headPrimarySport) {
      setSelectedSports((prev) => {
        return prev.map((s) => ({
          ...s,
          isPrincipal: s.id === headPrimarySport.id,
        }));
      });
    }
    setShowFamilyHeadSearch(false);
  };

  useEffect(() => {
    if (selectedFamilyHead) {
      const headPrimarySport = selectedFamilyHead.sports?.find(
        (sport) => sport.isPrincipal === true,
      );

      if (headPrimarySport) {
        setSelectedSports((prev) => {
          const existingSport = prev.find((s) => s.id === headPrimarySport.id);

          if (!existingSport) {
            return [
              ...prev.map((s) => ({ ...s, isPrincipal: false })),
              {
                id: headPrimarySport.id,
                isPrincipal: true,
                quoteId: headPrimarySport.quotes?.[0]?.id,
              },
            ];
          } else if (!existingSport.isPrincipal) {
            return prev.map((s) => ({
              ...s,
              isPrincipal: s.id === headPrimarySport.id,
            }));
          }

          return prev;
        });
      }
    }
  }, [selectedFamilyHead]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!member) return;
    console.log("Submitting form with data: ", {
      ...formData,
      sports_submit: selectedSports,
      societary_cuote: selectedSocietaryCuote,
    } as Member);

    const principalSport = selectedSports.find((s) => s.isPrincipal);

    if (!principalSport && formData.familyGroupStatus != FAMILY_STATUS.NONE) {
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
      formData.familyGroupStatus === FAMILY_STATUS.MEMBER &&
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
        sport.id === sportId ? { ...sport, quoteId: quoteId } : sport,
      ),
    );
  };

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {
      const timeout = setTimeout(() => {
        setShouldRender(false);
      }, 300); // duración de animación
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const isPrincipalSport = (sportId: number) =>
    selectedSports.some((s) => s.id === sportId && s.isPrincipal === true);

  if (!member) return null;

  return (
    <div className={`modal-overlay ${isOpen ? "fade-in" : "fade-out"}`}>
      <div className={`modal-content ${isOpen ? "scale-in" : "scale-out"}`}>
        <div className="modal-header">
          <h2 className="modal-title">Editar Socio</h2>
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
            selectedFamilyHead={selectedFamilyHead}
            setSelectedFamilyHead={setSelectedFamilyHead}
            setShowFamilyHeadSearch={setShowFamilyHeadSearch}
          />

          <div className="section-card">
            <div className="section-header">
              <Trophy className="section-icon" />
              <h3 className="section-title">Disciplinas</h3>
            </div>

            <DisciplineSection
              selectedSports={selectedSports}
              handleSportChange={handleSportChange}
              handleQuoteSelection={handleQuoteSelection}
              selectedFamilyHead={selectedFamilyHead}
              setPrimarySport={setPrimarySport}
            />
          </div>

          <div className="action-add-modal-button">
            <AppButton
              type="button"
              variant="secondary"
              onClick={() => {
                onClose();
                setSelectedFamilyHead(null);
                setSelectedSocietaryCuote(null);
                setSelectedSports([]);
                setFormData({
                  name: "",
                  second_name: "",
                  email: "",
                  phone_number: "",
                  dni: "",
                  birthdate: "",
                  familyGroupStatus: FAMILY_STATUS.NONE,
                  familyHeadId: undefined,
                });
              }}
              label="Cancelar"
            />
            <AppButton
              type="submit"
              variant="primary"
              label="Guardar Cambios"
            />
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
