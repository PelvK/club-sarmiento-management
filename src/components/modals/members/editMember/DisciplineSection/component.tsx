import { useSports } from "../../../../../hooks";
import { Member, SportSelection } from "../../../../../lib/types";
import { Lock } from "lucide-react";

export const DisciplineSection: React.FC<{
    selectedSports: SportSelection[];
    handleSportChange: (sportId: number, isSelected: boolean) => void;
    handleQuoteSelection: (sportId: number, quoteId: number) => void;
    selectedFamilyHead: Member | null;
    setPrimarySport: (sportId: number) => void;
}> = ({ handleSportChange, handleQuoteSelection, selectedSports, selectedFamilyHead, setPrimarySport }) => {

    const { sports } = useSports();

    const isSportSelected = (sportId: number) =>
    selectedSports.some((s) => s.id === sportId);

    const isPrincipalSport = (sportId: number) =>
    selectedSports.some((s) => s.id === sportId && s.isPrincipal == true);

  return (
    <>
      {selectedFamilyHead && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center text-yellow-800">
            <Lock className="h-4 w-4 mr-2" />
            <p className="text-sm font-medium">
              Como miembro de familia, heredarás automáticamente la disciplina
              principal del jefe de familia
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
                  {sport.name}
                </label>
              </div>

              {isSportSelected(sport.id) && (
                <div className="flex items-center">
                  <input
                    type="radio"
                    id={`primary-${sport.id}`}
                    name="primary-sport"
                    checked={isPrincipalSport(sport.id)}
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
    </>
  );
};
