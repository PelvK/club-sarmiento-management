import React, { useState, useEffect } from "react";
import { Trophy, Users, Search, Lock } from "lucide-react";
import { SearchFamilyHeadModal } from "./SearchFamilyHeadModal";
import { useSports } from "../../hooks/useSports";
import { FAMILY_STATUS, Member, SportSelection } from "../../types";
import { useMembers } from "../../hooks/useMembers";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: Omit<Member, "id">) => Promise<void>;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    second_name: "",
    email: "",
    phone_number: "",
    dni: "",
    birthdate: new Date().toISOString().split("T")[0],
    familyGroupStatus: FAMILY_STATUS.NONE,
    familyHeadId: "",
  });

  const [selectedSports, setSelectedSports] = useState<SportSelection[]>([]);
  const [showFamilyHeadSearch, setShowFamilyHeadSearch] = useState(false);
  const [selectedFamilyHead, setSelectedFamilyHead] = useState<Member | null>(
    null
  );
  const { sports } = useSports();
  const { familyHeads } = useMembers();

  const handleSportChange = (ID: string, checked: boolean) => {
    if (checked) {
      // If member has family head, new sport can't be primary
      const isPrimary = selectedSports.length === 0 && !selectedFamilyHead;
      setSelectedSports((prev) => [
        ...prev,
        {
          id: ID,
          isPrimary: isPrimary,
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
          !filtered.some((s) => s.isPrimary) &&
          !selectedFamilyHead
        ) {
          filtered[0].isPrimary = true;
        }
        return filtered;
      });
    }
  };

  const setPrimarySport = (ID: string) => {
    // Don't allow changing primary sport if member has family head
    if (selectedFamilyHead) return;

    setSelectedSports((prev) =>
      prev.map((sport) => ({
        ...sport,
        isPrimary: sport.id === ID,
      }))
    );
  };

  const handleFamilyHeadSelect = (head: Member) => {
    setSelectedFamilyHead(head);
    setFormData((prev) => ({ ...prev, familyHeadId: head.id }));

    // Get head's primary sport
    const headPrimarySport = head.sports?.find((sport) => sport.isPrincipal);
    if (headPrimarySport) {
      // Add head's primary sport to selected sports if not already selected
      setSelectedSports((prev) => {
        const existingSport = prev.find((s) => s.id === headPrimarySport.id);
        if (!existingSport) {
          return [
            ...prev.map((s) => ({ ...s, isPrimary: false })),
            { id: headPrimarySport.id, isPrimary: true },
          ];
        }
        return prev.map((s) => ({
          ...s,
          isPrimary: s.id === headPrimarySport.id,
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
        (sport) => sport.isPrincipal
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
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedSports.length === 0) {
      alert("Por favor, seleccione al menos una disciplina");
      return;
    }

    const primarySport = selectedSports.find((s) => s.isPrimary);
    if (!primarySport) {
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

    if (formData.familyGroupStatus == FAMILY_STATUS.MEMBER && !selectedFamilyHead) {
      alert(
        "Si seleciona miembro, debe tener un jefe seleccionado"
      );
      return;
    }

    await onSave({
      ...formData,
      sports_submit: selectedSports,
    });
    setSelectedSports([]);
    setSelectedFamilyHead(null);
    onClose();
  };

  const handleQuoteSelection = (sportId: string, quoteId: string) => {
    setSelectedSports((prev) =>
      prev.map((sport) =>
        sport.id === sportId ? { ...sport, quoteId: quoteId } : sport
      )
    );
  };

  const isSportSelected = (sportId: string) =>
    selectedSports.some((s) => s.id === sportId);

  const isPrimarySport = (sportId: string) =>
    selectedSports.some((s) => s.id === sportId && s.isPrimary);

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {" "}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Agregar Nuevo Socio
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
                required
              />
            </div>

            <div>
              <label
                htmlFor="second_name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Apellido
              </label>
              <input
                type="text"
                id="second_name"
                value={formData.second_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    second_name: e.target.value,
                  }))
                }
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
                required
              />
            </div>

            <div>
              <label
                htmlFor="dni"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                DNI
              </label>
              <input
                type="text"
                id="dni"
                value={formData.dni}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, dni: e.target.value }))
                }
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
                required
              />
            </div>

            <div>
              <label
                htmlFor="phone_number"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Teléfono
              </label>
              <input
                type="tel"
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    phone_number: e.target.value,
                  }))
                }
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
                required
              />
            </div>

            <div>
              <label
                htmlFor="birthdate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                id="birthdate"
                value={formData.birthdate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    birthdate: e.target.value,
                  }))
                }
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
                required
              />
            </div>
          </div>

          {/* Family Group Section */}
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <Users className="h-5 w-5 text-[#FFD700] mr-2" />
              <h3 className="text-lg font-medium text-gray-900">
                Grupo Familiar
              </h3>
            </div>

            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={formData.familyGroupStatus == FAMILY_STATUS.HEAD}
                  onChange={() => {
                    setFormData((prev) => ({
                      ...prev,
                      familyGroupStatus: FAMILY_STATUS.HEAD,
                      familyHeadId: "",
                    }));
                    setSelectedFamilyHead(null);
                  }}
                  className="form-radio text-[#FFD700] focus:ring-[#FFD700]"
                  name="familyRole"
                />
                <span className="ml-2">Jefe de Familia</span>
              </label>

              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={formData.familyGroupStatus == FAMILY_STATUS.MEMBER}
                  onChange={() =>
                    setFormData((prev) => ({
                      ...prev,
                      familyGroupStatus: FAMILY_STATUS.MEMBER,
                    }))
                  }
                  className="form-radio text-[#FFD700] focus:ring-[#FFD700]"
                  name="familyRole"
                />
                <span className="ml-2">Miembro de Familia</span>
              </label>

              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={formData.familyGroupStatus == FAMILY_STATUS.NONE}
                  onChange={() => {
                    setFormData((prev) => ({
                      ...prev,
                      familyGroupStatus: FAMILY_STATUS.NONE,
                      familyHeadId: "",
                    }));
                    setSelectedFamilyHead(null);
                  }}
                  className="form-radio text-[#FFD700] focus:ring-[#FFD700]"
                  name="familyRole"
                />
                <span className="ml-2">Ninguno</span>
              </label>
            </div>

            {formData.familyGroupStatus == FAMILY_STATUS.MEMBER && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jefe de Familia
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 p-2 border rounded-md bg-gray-50">
                    {selectedFamilyHead ? (
                      <div>
                        <div className="font-medium">
                          {selectedFamilyHead.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          DNI: {selectedFamilyHead.dni}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500">
                        Ningún jefe de familia seleccionado
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFamilyHeadSearch(true)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFD700]"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sports Selection */}
          <div className="flex items-center mb-4">
            <Trophy className="h-5 w-5 text-[#FFD700] mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Disciplinas</h3>
          </div>

          {selectedFamilyHead && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center text-yellow-800">
                <Lock className="h-4 w-4 mr-2" />
                <p className="text-sm font-medium">
                  Como miembro de familia, heredarás automáticamente la
                  disciplina principal del jefe de familia
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {sports.map((sport) => (
              <div
                key={sport.id}
                className={`border rounded-lg transition-all duration-200 ${
                  isSportSelected(sport.id)
                    ? "border-[#FFD700] shadow-md"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`sport-${sport.id}`}
                      checked={isSportSelected(sport.id)}
                      onChange={(e) =>
                        handleSportChange(sport.id, e.target.checked)
                      }
                      className="h-5 w-5 text-[#FFD700] focus:ring-[#FFD700] border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`sport-${sport.id}`}
                      className="ml-3 font-medium text-gray-900"
                    >
                      {sport.description}
                    </label>
                  </div>

                  {isSportSelected(sport.id) && (
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id={`primary-${sport.id}`}
                        name="primary-sport"
                        checked={isPrimarySport(sport.id)}
                        onChange={() => setPrimarySport(sport.id)}
                        className="h-5 w-5 text-[#FFD700] focus:ring-[#FFD700] border-gray-300"
                      />
                      <label
                        htmlFor={`primary-${sport.id}`}
                        className="ml-2 text-sm font-medium text-gray-700"
                      >
                        Disciplina Principal
                      </label>
                    </div>
                  )}
                </div>

                {isSportSelected(sport.id) && (
                  <div className="bg-gray-50 p-4 rounded-b-lg border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Seleccione tipo de cuota:
                    </h4>
                    <div className="space-y-3">
                      {sport.quotes?.map((quote) => (
                        <div key={quote.id} className="flex items-center">
                          <input
                            type="radio"
                            id={`quote-${sport.id}-${quote.id}`}
                            name={`quote-${sport.id}`}
                            value={quote.id}
                            onChange={() =>
                              handleQuoteSelection(sport.id, quote.id)
                            }
                            className="h-4 w-4 text-[#FFD700] focus:ring-[#FFD700] border-gray-300"
                          />
                          <label
                            htmlFor={`quote-${sport.id}-${quote.id}`}
                            className="ml-3 flex justify-between w-full"
                          >
                            <span className="text-sm font-medium text-gray-700">
                              {quote.description}
                            </span>
                            <span className="text-sm text-gray-900 font-semibold">
                              ${quote.price}
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                onClose();
                setSelectedFamilyHead(null);
                setSelectedSports([]);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFD700]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#FFD700] text-black rounded-md hover:bg-[#FFC000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFD700]"
            >
              Guardar
            </button>
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
