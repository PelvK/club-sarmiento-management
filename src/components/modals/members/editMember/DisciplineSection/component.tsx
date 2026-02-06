import { useSports } from "../../../../../hooks";
import { Member, SportSelection } from "../../../../../lib/types";
import { Lock } from "lucide-react";

export const DisciplineSection: React.FC<{
  selectedSports: SportSelection[];
  handleSportChange: (sportId: number, isSelected: boolean) => void;
  handleQuoteSelection: (sportId: number, quoteId: number) => void;
  selectedFamilyHead: Member | null;
  setPrimarySport: (sportId: number) => void;
}> = ({
  handleSportChange,
  handleQuoteSelection,
  selectedSports,
  selectedFamilyHead,
  setPrimarySport,
}) => {
  const { sports } = useSports();


  /* const canUncheckSport = (sportId: number): boolean => {
    // Si es el deporte principal heredado del jefe, no se puede desmarcar
    if (isInheritedPrimarySport(sportId)) {
      return false;
    }
    return true;
  }; */

  const isSportSelected = (sportId: number) =>
    selectedSports.some((s) => s.id === sportId);

  const isPrincipalSport = (sportId: number) =>
    selectedSports.some((s) => s.id === sportId && s.isPrincipal === true);

  // Obtener el ID del deporte principal del jefe de familia
  const getFamilyHeadPrimarySportId = (): number | null => {
    if (!selectedFamilyHead || !selectedFamilyHead.sports) return null;
    const primarySport = selectedFamilyHead.sports.find((s) => s.isPrincipal === true);
    return primarySport ? primarySport.id : null;
  };

  const familyHeadPrimarySportId = getFamilyHeadPrimarySportId();

  // Verificar si un deporte es el principal heredado del jefe
  const isInheritedPrimarySport = (sportId: number): boolean => {
    return familyHeadPrimarySportId === sportId;
  };

  return (
    <>
      {selectedFamilyHead && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center text-yellow-800">
            <Lock className="h-4 w-4 mr-2" />
            <p className="text-sm font-medium">
              Como miembro de familia, heredará automáticamente la disciplina
              principal del jefe de familia
            </p>
          </div>
        </div>
      )}
      {sports.length === 0 && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-500">
            No hay disciplinas deportivas disponibles. Por favor, crea una en la
            sección de deportes.
          </p>
        </div>
      )}
      <div className="space-y-4">
        {sports.map((sport) => {
          const isInherited = isInheritedPrimarySport(sport.id);
          const isLocked = isInherited;

          return (
            <div
              key={sport.id}
              className={`border rounded-lg transition-all duration-200 ${
                isSportSelected(sport.id)
                  ? "border-[#FFD700] shadow-md"
                  : "border-gray-200"
              } ${isLocked ? "bg-yellow-50" : ""}`}
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`sport-${sport.id}`}
                    checked={isSportSelected(sport.id)}
                    onChange={(e) => {
                      if (isLocked && !e.target.checked) {
                        // Prevenir desmarcar el deporte heredado
                        return;
                      }
                      handleSportChange(sport.id, e.target.checked);
                    }}
                    disabled={isLocked}
                    className={`h-5 w-5 text-[#FFD700] focus:ring-[#FFD700] border-gray-300 rounded ${
                      isLocked ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  />
                  <label
                    htmlFor={`sport-${sport.id}`}
                    className={`ml-3 font-medium text-gray-900 flex items-center ${
                      isLocked ? "opacity-75" : ""
                    }`}
                  >
                    {sport.name}
                    {isLocked && (
                      <Lock className="h-3 w-3 ml-2 text-yellow-600" />
                    )}
                  </label>
                </div>

                {isSportSelected(sport.id) && (
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id={`primary-${sport.id}`}
                      name="primary-sport"
                      checked={isPrincipalSport(sport.id)}
                      onChange={() => {
                        // No permitir cambiar si hay un jefe de familia
                        if (!selectedFamilyHead) {
                          setPrimarySport(sport.id);
                        }
                      }}
                      disabled={selectedFamilyHead !== null}
                      className={`h-5 w-5 text-[#FFD700] focus:ring-[#FFD700] border-gray-300 ${
                        selectedFamilyHead ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    />
                    <label
                      htmlFor={`primary-${sport.id}`}
                      className={`ml-2 text-sm font-medium text-gray-700 ${
                        selectedFamilyHead ? "opacity-75" : ""
                      }`}
                    >
                      Disciplina Principal
                      {isInherited && (
                        <span className="text-xs text-yellow-600 ml-1">
                          (Heredado)
                        </span>
                      )}
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
                          checked={
                            selectedSports.find((s) => s.id === sport.id)
                              ?.quoteId === quote.id
                          }
                          onChange={() =>
                            handleQuoteSelection(sport.id, quote.id!)
                          }
                          className="h-4 w-4 text-[#FFD700] focus:ring-[#FFD700] border-gray-300"
                        />
                        <label
                          htmlFor={`quote-${sport.id}-${quote.id}`}
                          className="ml-3 flex justify-between w-full"
                        >
                          <div className="flex items-center justify-between gap-4 w-full">
                            {/* Contenedor izquierdo - se puede truncar */}
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className="text-sm font-medium text-gray-700 flex-shrink-0">
                                {quote.name}
                              </span>
                              {quote.description && (
                                <span className="text-sm text-gray-500 truncate">
                                  - {quote.description}
                                </span>
                              )}
                            </div>

                            {/* Precio - siempre visible a la derecha */}
                            <span className="text-sm text-gray-900 font-semibold flex-shrink-0">
                              ${quote.price}
                            </span>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};