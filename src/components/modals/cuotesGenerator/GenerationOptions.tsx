import React from "react";
import { Settings } from "lucide-react";
import { GenerationConfig, DisciplineMode } from "../../../lib/types/quote";

interface GenerationOptionsProps {
  config: GenerationConfig;
  onConfigChange: (config: GenerationConfig) => void;
}

export const GenerationOptions: React.FC<GenerationOptionsProps> = ({
  config,
  onConfigChange,
}) => {
  const disciplineModes: { value: DisciplineMode; label: string; description: string }[] = [
    {
      value: 'principals-with-secondary',
      label: 'Principales + Secundarias',
      description: 'Genera cuotas principales con sus secundarias incluidas'
    },
    {
      value: 'only-principals',
      label: 'Solo Principales',
      description: 'Genera solo cuotas de disciplinas principales'
    },
    {
      value: 'only-secondary',
      label: 'Solo Secundarias',
      description: 'Genera solo cuotas de disciplinas secundarias'
    }
  ];

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

        <div className="p-4 border-2 border-gray-200 rounded-lg bg-white">
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Tipo de disciplinas a generar
          </label>
          <div className="space-y-2">
            {disciplineModes.map((mode) => (
              <label
                key={mode.value}
                className={`flex items-start gap-3 cursor-pointer p-3 rounded-lg transition-all duration-200 border-2 ${
                  config.disciplineMode === mode.value
                    ? "bg-[#FFD700]/10 border-[#FFD700] shadow-sm"
                    : "bg-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                <div
                  className={`relative w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 mt-0.5 ${
                    config.disciplineMode === mode.value
                      ? "border-[#FFD700] bg-[#FFD700]"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {config.disciplineMode === mode.value && (
                    <div className="w-2 h-2 rounded-full bg-[#1a1a1a]" />
                  )}
                </div>
                <input
                  type="radio"
                  name="disciplineMode"
                  checked={config.disciplineMode === mode.value}
                  onChange={() =>
                    onConfigChange({
                      ...config,
                      disciplineMode: mode.value,
                    })
                  }
                  className="hidden"
                />
                <div className="flex-1">
                  <span className={`block text-sm font-medium ${
                    config.disciplineMode === mode.value ? "text-gray-900" : "text-gray-700"
                  }`}>
                    {mode.label}
                  </span>
                  <span className="block text-xs text-gray-500 mt-0.5">
                    {mode.description}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>
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
