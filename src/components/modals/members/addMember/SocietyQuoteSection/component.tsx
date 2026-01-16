import { LucideCreditCard } from "lucide-react";
import { useCuotes } from "../../../../../hooks";
import { Quote } from "../../../../../lib/types/quote";

export const SocietyQuoteSection: React.FC<{
  selectedSocietaryCuote: Quote | null;
  setSelectedSocietaryCuote: React.Dispatch<React.SetStateAction<Quote | null>>;
}> = ({ selectedSocietaryCuote, setSelectedSocietaryCuote }) => {
  const { societaryCuotes } = useCuotes();

  const isSocietaryCuoteSelected = (cuoteID: number) =>
    selectedSocietaryCuote !== null && selectedSocietaryCuote.id === cuoteID;

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <LucideCreditCard className="h-5 w-5 text-[#FFD700] mr-2" />
        <h3 className="text-lg font-medium text-gray-900">Tipo de socio</h3>
      </div>

      <div className="space-y-4">
        {societaryCuotes.map((cuote) => (
          <div
            key={cuote.id}
            className={`border rounded-lg transition-all duration-200 ${
              isSocietaryCuoteSelected(cuote.id!)
                ? "border-[#FFD700] shadow-md"
                : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`cuote-${cuote.id}`}
                  checked={isSocietaryCuoteSelected(cuote.id!)}
                  onChange={() => setSelectedSocietaryCuote(cuote)}
                  className="h-5 w-5 text-[#FFD700] focus:ring-[#FFD700] border-gray-300 rounded"
                />
                <label
                  htmlFor={`cuote-${cuote.id}`}
                  className="ml-3 font-medium text-gray-900"
                >
                  {cuote.description}
                </label>
              </div>
              <div className="flex items-center">
                <label
                  htmlFor={`cuote-price-${cuote.id}`}
                  className="ml-2 text-sm text-gray-900 font-semibold"
                >
                  ${cuote.price}
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};