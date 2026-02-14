import React from "react";
import { Edit3 } from "lucide-react";
import { Member } from "../../../lib/types/member";
import { GenerationConfig } from "../../../lib/types/quote";

interface CustomAmountsEditorProps {
  filteredMembers: Member[];
  config: GenerationConfig;
  onConfigChange: (config: GenerationConfig) => void;
}

export const CustomAmountsEditor: React.FC<CustomAmountsEditorProps> = ({
  filteredMembers,
  config,
  onConfigChange,
}) => {
  const handleCustomAmountChange = (
    memberId: number,
    sportId: number,
    amount: number
  ) => {
    const key = `${memberId}-${sportId}`;
    const newCustomAmounts = { ...config.customAmounts };

    if (amount) {
      newCustomAmounts[key] = amount;
    } else {
      delete newCustomAmounts[key];
    }

    onConfigChange({
      ...config,
      customAmounts: newCustomAmounts,
    });
  };

  if (filteredMembers.length === 0) return null;

  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
        <Edit3 className="w-5 h-5 text-[#FFD700]" />
        Montos Personalizados <span className="text-sm font-normal text-gray-500">(opcional)</span>
      </h3>

      <div className="overflow-x-auto">
        <div className="max-h-96 overflow-y-auto border-2 border-gray-200 rounded-lg" style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#d1d5db #f3f4f6"
        }}>
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-gray-100 to-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-800 border-b-2 border-gray-300">
                  Socio
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-800 border-b-2 border-gray-300">
                  Disciplinas y Montos
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMembers.map((member) => {
                const visibleSports = member.sports?.filter(
                  (sport) =>
                    config.selectedSports.length === 0 ||
                    config.selectedSports.includes(sport.id)
                );

                if (!visibleSports || visibleSports.length === 0) return null;

                return (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 align-top">
                      <div className="font-medium text-gray-900 whitespace-nowrap">
                        {member.name} {member.second_name}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        DNI: {member.dni}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {visibleSports.map((sport) => (
                          <div key={sport.id} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                            <label className="text-xs font-medium text-gray-700 whitespace-nowrap">
                              {sport.name}
                              {sport.isPrincipal && (
                                <span className="ml-1 text-[#FFD700] text-[10px]">★</span>
                              )}
                            </label>
                            <input
                              type="number"
                              placeholder={`$${sport.quotes?.[0]?.price || "0"}`}
                              value={
                                config.customAmounts[`${member.id}-${sport.id}`] || ""
                              }
                              onChange={(e) =>
                                handleCustomAmountChange(
                                  member.id,
                                  sport.id,
                                  parseFloat(e.target.value)
                                )
                              }
                              className="w-24 px-2 py-1 text-xs border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition-all"
                              min="0"
                              step="50"
                            />
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-600 flex items-start gap-2 bg-blue-50 p-3 rounded-lg border border-blue-200">
        <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <div>
          <strong className="text-blue-800">Nota:</strong> Los montos predeterminados se muestran como placeholder. Solo ingrese un valor si desea personalizarlo. Las disciplinas principales están marcadas con ★
        </div>
      </div>
    </section>
  );
};
