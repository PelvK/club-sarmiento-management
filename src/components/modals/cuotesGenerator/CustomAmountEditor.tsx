import React from "react";
import { Users } from "lucide-react";
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
    <section>
      <h3 className="text-lg font-semibold mb-4">
        Montos Personalizados (opcional)
      </h3>
      <div className="max-h-80 overflow-y-auto bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
        {filteredMembers.map((member) => {
          const visibleSports = member.sports?.filter(
            (sport) =>
              config.selectedSports.length === 0 ||
              config.selectedSports.includes(sport.id)
          );

          if (!visibleSports || visibleSports.length === 0) return null;

          return (
            <div
              key={member.id}
              className="bg-white rounded-lg p-4 border border-gray-200"
            >
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                {member.name} {member.second_name}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {visibleSports.map((sport) => (
                  <div key={sport.id} className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600">
                      {sport.name}
                      {sport.isPrincipal && (
                        <span className="ml-1 text-blue-600">(Principal)</span>
                      )}
                    </label>
                    <input
                      type="number"
                      placeholder={`Predeterminado: $${sport.quotes?.[0]?.price || "0"}`}
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
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
                      min="0"
                      step="0.01"
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
