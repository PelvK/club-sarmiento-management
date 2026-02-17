import { LucideCreditCard } from "lucide-react";
import { Quote } from "../../../../../lib/types";
import { useCuotes } from "../../../../../hooks";

export const SocietyQuoteSection: React.FC<{
  selectedSocietaryCuote: Quote | null;
  setSelectedSocietaryCuote: (cuote: Quote) => void;
}> = ({ selectedSocietaryCuote, setSelectedSocietaryCuote }) => {
  const isSocietaryCuoteSelected = (cuoteID: number) =>
    selectedSocietaryCuote?.id == cuoteID;

  const { societaryCuotes } = useCuotes();
  return (
    <div className="section-card">
      <div className="section-header">
        <LucideCreditCard className="section-icon" />
        <h3 className="section-title">Tipo de socio</h3>
      </div>

      <div className="space-y-4">
        {societaryCuotes && societaryCuotes.length === 0 && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-500">
              No hay tipos de socio disponibles. Por favor, crea uno en la
              sección de cuotas societarias.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {societaryCuotes.map((cuote) => (
            <div
              key={cuote.id}
              className={`border-2 rounded-lg transition-all duration-200 ${
                isSocietaryCuoteSelected(cuote.id!)
                  ? "border-[#FFD700] shadow-md bg-[#fffbeb]"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`cuote-${cuote.id}`}
                    checked={isSocietaryCuoteSelected(cuote.id)}
                    onChange={() => setSelectedSocietaryCuote(cuote)}
                    className="h-5 w-5 text-[#FFD700] focus:ring-[#FFD700] border-gray-300 rounded"
                  />
                  <div className="flex-1 min-w-0 ml-3">
                    <h4 className="font-semibold text-gray-900 text-sm truncate">
                      {cuote.name}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {cuote.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="ml-2 text-sm text-gray-900 font-semibold">
                    ${cuote.price}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
