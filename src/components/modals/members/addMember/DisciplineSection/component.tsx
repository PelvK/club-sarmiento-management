import { Member } from "../../../../../lib/types/member";
import { Sport, SportSelection } from "../../../../../lib/types/sport";
import { Lock } from "lucide-react";

export const DisciplinesSection: React.FC<{
  sports: Sport[];
  selectedSports: SportSelection[];
  selectedFamilyHead?: Member | null;
  onSportChange: (ID: number, checked: boolean) => void;
  onSetPrimarySport: (ID: number) => void;
  isSportSelected: (sportId: number) => boolean;
  isPrimarySport: (sportId: number) => boolean;
  onQuoteSelect: (sportId: number, quoteId: number) => void;
}> = ({
  sports,
  onSportChange,
  onSetPrimarySport,
  isSportSelected,
  isPrimarySport,
  onQuoteSelect,
  selectedFamilyHead,
}) => {
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
                  onChange={(e) => onSportChange(sport.id, e.target.checked)}
                  className="h-5 w-5 text-[#FFD700] focus:ring-[#FFD700] border-gray-300 rounded"
                />
                <label
                  htmlFor={`sport-${sport.id}`}
                  className="ml-3 font-medium text-gray-900"
                >
                  {sport.name}
                </label>
              </div>

              {isSportSelected(sport.id) && (
                <div className="flex items-center">
                  <input
                    type="radio"
                    id={`primary-${sport.id}`}
                    name="primary-sport"
                    checked={isPrimarySport(sport.id)}
                    onChange={() => onSetPrimarySport(sport.id)}
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
                        onChange={() => onQuoteSelect(sport.id, quote.id!)}
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
        ))}
      </div>
    </>
  );
};

