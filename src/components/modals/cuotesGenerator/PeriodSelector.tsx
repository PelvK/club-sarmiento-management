import React from "react";
import { Calendar } from "lucide-react";
import { GenerationConfig } from "../../../lib/types/quote";

interface PeriodSelectorProps {
  config: GenerationConfig;
  onConfigChange: (config: GenerationConfig) => void;
}

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  config,
  onConfigChange,
}) => {
  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() + i
  );

  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
        <Calendar className="w-5 h-5 text-[#FFD700]" />
        Período de Generación
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Mes
          </label>
          <select
            value={config.month}
            onChange={(e) =>
              onConfigChange({
                ...config,
                month: parseInt(e.target.value),
              })
            }
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition-all duration-200 bg-white font-medium text-gray-900"
          >
            {MONTHS.map((month, index) => (
              <option key={index} value={index + 1}>
                {month}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Año
          </label>
          <select
            value={config.year}
            onChange={(e) =>
              onConfigChange({
                ...config,
                year: parseInt(e.target.value),
              })
            }
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition-all duration-200 bg-white font-medium text-gray-900"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export { MONTHS };