import React from "react";
import { Settings } from "lucide-react";
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
    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
        <Settings className="w-5 h-5 text-[#FFD700]" />
        Opciones de Generación
      </h3>

      <div className="space-y-3 mb-5">
        <label className="flex items-center justify-between cursor-pointer p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200 bg-white">
          <span className="text-sm font-semibold text-gray-800">
            Incluir cuotas societarias
          </span>
          <button
            type="button"
            onClick={() =>
              onConfigChange({
                ...config,
                includeSocietary: !config.includeSocietary,
              })
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:ring-offset-2 ${
              config.includeSocietary ? "bg-[#FFD700]" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                config.includeSocietary ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </label>

        <label className="flex items-center justify-between cursor-pointer p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200 bg-white">
          <span className="text-sm font-semibold text-gray-800">
            Incluir disciplinas secundarias
          </span>
          <button
            type="button"
            onClick={() =>
              onConfigChange({
                ...config,
                includeNonPrincipalSports: !config.includeNonPrincipalSports,
              })
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:ring-offset-2 ${
              config.includeNonPrincipalSports ? "bg-[#FFD700]" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                config.includeNonPrincipalSports ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </label>
      </div>

      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-semibold text-gray-800 mb-2"
        >
          Notas adicionales (opcional)
        </label>
        <textarea
          id="notes"
          value={config.notes}
          onChange={(e) =>
            onConfigChange({ ...config, notes: e.target.value })
          }
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition-all duration-200 resize-none"
          rows={3}
          placeholder="Ingrese notas adicionales para esta generación..."
        />
      </div>
    </section>
  );
};
