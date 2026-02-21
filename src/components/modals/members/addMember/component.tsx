import React, { useState, useEffect, useCallback } from "react";
import { Trophy } from "lucide-react";
import { SearchFamilyHeadModal } from "../SearchFamilyHeadModal";
import { useSports, useMembers, useAuth } from "../../../../hooks";
import { FAMILY_STATUS } from "../../../../lib/enums/SportSelection";
import { Sport, SportSelection } from "../../../../lib/types/sport";
import { Member } from "../../../../lib/types/member";
import { Quote } from "../../../../lib/types/quote";
import { AppButton } from "../../../common/AppButton/component";
import { DisciplinesSection } from "./DisciplineSection";
import { MemberFormData, AddMemberModalProps } from "../types";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { FamilyGroupSection } from "./FamilyGroupSection";
import { SocietyQuoteSection } from "./SocietyQuoteSection";
import { useErrorHandler } from "../../../../hooks/useErrorHandler";
import "./styles.css";
import { CONSOLE_LOG } from "../../../../lib/utils/consts";
import { ErrorModal } from "../../common/ErrorModal";
import { ConfirmationModal } from "../../common/confirmationModal/component";

const emptyForm: MemberFormData = {
  name: "",
  second_name: "",
  email: "",
  phone_number: "",
  dni: "",
  address: "",
  birthdate: new Date().toISOString().split("T")[0],
  familyGroupStatus: FAMILY_STATUS.NONE,
  familyHeadId: undefined,
};

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState(emptyForm);
  const [selectedSports, setSelectedSports] = useState<SportSelection[]>([]);
  const [selectedSocietaryCuote, setSelectedSocietaryCuote] =
    useState<Quote | null>(null);
  const [showFamilyHeadSearch, setShowFamilyHeadSearch] = useState(false);
  const [selectedFamilyHead, setSelectedFamilyHead] = useState<Member | null>(
    null,
  );
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [availableSports, setAvailableSports] = useState<Sport[]>([]);
  const { sports } = useSports();
  const { familyHeads } = useMembers();

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState<MemberFormData | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { error, isErrorModalOpen, handleError, closeErrorModal } =
    useErrorHandler();

  useEffect(() => {
    if (CONSOLE_LOG) {
      console.log(user);
      console.log(sports);
    }
    if (!user?.is_admin) {
      setAvailableSports(
        sports.filter((avsp) =>
          user?.sport_supported?.find(
            (sp) => Number(sp.id) === Number(avsp.id),
          ),
        ),
      );
    } else {
      setAvailableSports(sports);
    }
  }, [sports, user]);

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
    if (CONSOLE_LOG) {
      console.log("Selected family head: ", head);
    }
    setSelectedFamilyHead(head);
    setFormData((prev: MemberFormData) => ({ ...prev, familyHeadId: head.id }));
    if (CONSOLE_LOG) {
      console.log("Head sports: ", head.sports);
    }
    const headPrimarySport = head.sports?.filter(
      (sport) => sport.isPrincipal == true,
    );
    if (CONSOLE_LOG) {
      console.log("Head primary sport: ", headPrimarySport);
    }
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

  const validateForm = (): boolean => {
    const primarySport = selectedSports.find((s) => s.isPrincipal);

    if (!primarySport && formData.familyGroupStatus != FAMILY_STATUS.NONE) {
      handleError({
        success: false,
        message: "Por favor, seleccione una disciplina principal",
      });
      return false;
    }

    if (!primarySport && selectedSports.length > 0) {
      handleError({
        success: false,
        message: "Por favor, seleccione una disciplina principal",
      });
      return false;
    }

    const sportsWithoutQuotes = selectedSports.filter(
      (s) => s.quoteId === undefined,
    );

    if (sportsWithoutQuotes.length > 0) {
      handleError({
        success: false,
        message:
          "Todas las disciplinas seleccionadas deben tener una cuota asociada",
      });
      return false;
    }

    if (
      formData.familyGroupStatus == FAMILY_STATUS.MEMBER &&
      !selectedFamilyHead
    ) {
      handleError({
        success: false,
        message: "Si selecciona miembro, debe tener un jefe seleccionado",
      });
      return false;
    }

    if (
      selectedSports.length === 0 &&
      formData.familyGroupStatus != FAMILY_STATUS.NONE
    ) {
      handleError({
        success: false,
        message: "Por favor, seleccione al menos una disciplina",
      });
      return false;
    }

    if (selectedSocietaryCuote === null) {
      handleError({
        success: false,
        message: "Por favor, debe seleccionar una cuota societaria",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const dataToSubmit = {
      ...formData,
      sports_submit: selectedSports,
      societary_cuote: selectedSocietaryCuote,
    };

    setPendingSubmit(dataToSubmit);
    setShowConfirmation(true);
  };

  const handleConfirmSave = async () => {
    if (!pendingSubmit) return;

    setIsSubmitting(true);

    try {
      await onSave(pendingSubmit);
      setShowConfirmation(false);
      setSelectedSports([]);
      setSelectedFamilyHead(null);
      setSelectedSocietaryCuote(null);
      setFormData(emptyForm);
      setPendingSubmit(null);
      onClose();
    } catch (error) {
      setShowConfirmation(false);
      setPendingSubmit(null);
      setTimeout(() => {
        handleError(error);
      }, 100);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuoteSelection = (sportId: number, quoteId: number) => {
    setSelectedSports((prev) =>
      prev.map((sport) =>
        sport.id === sportId ? { ...sport, quoteId: quoteId } : sport,
      ),
    );
  };

  const resetForm = useCallback(() => {
    setFormData(emptyForm);
    setSelectedSports([]);
    setSelectedSocietaryCuote(null);
    setSelectedFamilyHead(null);
    setPendingSubmit(null);
    setShowConfirmation(false);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

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
    <>
      <div className={`modal-overlay ${isOpen ? "fade-in" : "fade-out"}`}>
        <div className={`modal-content ${isOpen ? "scale-in" : "scale-out"}`}>
          <div className="modal-header">
            <h2 className="modal-title">Agregar Nuevo Socio</h2>
            <button
              className="modal-close-btn"
              onClick={handleClose}
              aria-label="Cerrar"
            >
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

            <div className="section-card">
              <div className="section-header">
                <Trophy className="section-icon" />
                <h3 className="section-title">Disciplinas</h3>
              </div>

              <DisciplinesSection
                sports={availableSports}
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

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => {
          setShowConfirmation(false);
          setPendingSubmit(null);
        }}
        onConfirm={handleConfirmSave}
        title="¿Confirmar creación de socio?"
        message={`¿Estás seguro de que deseas crear el socio ${formData.name} ${formData.second_name}?`}
        confirmText="Sí, crear"
        cancelText="No, revisar"
        type="success"
        isLoading={isSubmitting}
      />

      {error && (
        <ErrorModal
          isOpen={isErrorModalOpen}
          onClose={closeErrorModal}
          error={error}
          showDetails={process.env.NODE_ENV === "development"}
        />
      )}
    </>
  );
};
