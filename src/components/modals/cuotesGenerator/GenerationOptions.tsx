import React from "react";
import { DollarSign } from "lucide-react";
import { GenerationConfig } from "../../../lib/types/quote";

interface GenerationOptionsProps {
  config: GenerationConfig;
  onConfigChange: (config: GenerationConfig) => void;
}

export const GenerationOptions: React.FC<GenerationOptionsProps> = ({
  config,
  onConfigChange,
}) => {
  return (
    <section>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-[#1a1a1a]" />
        Opciones de Generación
      </h3>

      <div className="space-y-3">
        <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
          <input
            type="checkbox"
            checked={config.includeSocietary}
            onChange={(e) =>
              onConfigChange({
                ...config,
                includeSocietary: e.target.checked,
              })
            }
            className="w-4 h-4 text-[#1a1a1a] focus:ring-[#1a1a1a]"
          />
          <span className="text-sm font-medium text-gray-700">
            Incluir cuotas societarias
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
          <input
            type="checkbox"
            checked={config.includeNonPrincipalSports}
            onChange={(e) =>
              onConfigChange({
                ...config,
                includeNonPrincipalSports: e.target.checked,
              })
            }
            className="w-4 h-4 text-[#1a1a1a] focus:ring-[#1a1a1a]"
          />
          <span className="text-sm font-medium text-gray-700">
            Incluir disciplinas secundarias
          </span>
        </label>
      </div>

      <div className="mt-4">
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Notas adicionales (opcional)
        </label>
        <textarea
          id="notes"
          value={config.notes}
          onChange={(e) =>
            onConfigChange({ ...config, notes: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
          rows={3}
          placeholder="Ingrese notas adicionales para esta generación..."
        />
      </div>
    </section>
  );
};
