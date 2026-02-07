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
    <section>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-[#1a1a1a]" />
        Período de Generación
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
          >
            {MONTHS.map((month, index) => (
              <option key={index} value={index + 1}>
                {month}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
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