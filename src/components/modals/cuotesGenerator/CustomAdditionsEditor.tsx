import React from "react";
import { Trash2, Zap, Tag } from "lucide-react";
import { GenerationConfig, CustomAddition } from "../../../lib/types/quote";

interface CustomAdditionsEditorProps {
  config: GenerationConfig;
  onConfigChange: (config: GenerationConfig) => void;
}

const ADDITION_TYPES: {
  value: CustomAddition["type"];
  label: string;
  description: string;
}[] = [
  {
    value: "NORMAL",
    label: "Normal",
    description: "Se suma al total de la cuota",
  },
  {
    value: "VENCIMIENTO",
    label: "Vencimiento",
    description: "Recargo por pago fuera de término (genera Total 1 y Total 2)",
  },
];

export const CustomAdditionsEditor: React.FC<CustomAdditionsEditorProps> = ({
  config,
  onConfigChange,
}) => {
  const additions = config.customAdditions ?? [];

/*   const handleAdd = () => {
    const newAddition: CustomAddition = {
      id: crypto.randomUUID(),
      description: "",
      amount: 0,
      type: "NORMAL",
    };
    onConfigChange({
      ...config,
      customAdditions: [...additions, newAddition],
    });
  }; */

  const handleRemove = (id: string) => {
    onConfigChange({
      ...config,
      customAdditions: additions.filter((a) => a.id !== id),
    });
  };

  const handleChange = (
    id: string,
    field: keyof CustomAddition,
    value: string | number,
  ) => {
    onConfigChange({
      ...config,
      customAdditions: additions.map((a) =>
        a.id === id ? { ...a, [field]: value } : a,
      ),
    });
  };

  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900">
          <Tag className="w-5 h-5 text-[#FFD700]" />
          Agregados Personalizados{" "}
          <span className="text-sm font-normal text-gray-500">(opcional)</span>
        </h3>
{/*         <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold bg-[#FFD700] hover:bg-yellow-400 text-black rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Agregar
        </button> */}
      </div>

      {additions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
          <Tag className="w-8 h-8 text-gray-300 mb-2" />
          <p className="text-sm text-gray-400 font-medium">
            No hay agregados personalizados
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {/*Clic en "Agregar" para añadir un concepto extra a todas las cuotas*/} No habilitado aún
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {additions.map((addition, index) => (
            <div
              key={addition.id}
              className="flex flex-col sm:flex-row gap-3 p-4 bg-gray-50 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-all duration-200"
            >
              {/* Index badge */}
              <div className="flex items-start pt-1">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#FFD700] text-black text-xs font-bold flex-shrink-0">
                  {index + 1}
                </span>
              </div>

              {/* Descripción */}
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  value={addition.description}
                  onChange={(e) =>
                    handleChange(addition.id, "description", e.target.value)
                  }
                  placeholder="Ej: Seguro deportivo, Matrícula anual..."
                  className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition-all bg-white"
                />
              </div>

              {/* Monto */}
              <div className="w-full sm:w-32 flex-shrink-0">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Monto ($)
                </label>
                <input
                  type="number"
                  value={addition.amount || ""}
                  onChange={(e) =>
                    handleChange(
                      addition.id,
                      "amount",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  placeholder="0"
                  min="0"
                  step="50"
                  className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition-all bg-white"
                />
              </div>

              {/* Tipo */}
              <div className="w-full sm:w-44 flex-shrink-0">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Tipo
                </label>
                <div className="flex gap-1">
                  {ADDITION_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      title={t.description}
                      onClick={() => handleChange(addition.id, "type", t.value)}
                      className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-xs font-semibold rounded-lg border-2 transition-all duration-200 ${
                        addition.type === t.value
                          ? t.value === "VENCIMIENTO"
                            ? "bg-orange-100 border-orange-400 text-orange-700"
                            : "bg-[#FFD700]/20 border-[#FFD700] text-black"
                          : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      {t.value === "VENCIMIENTO" ? (
                        <Zap className="w-3 h-3" />
                      ) : (
                        <Tag className="w-3 h-3" />
                      )}
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delete */}
              <div className="flex items-end pb-0.5">
                <button
                  type="button"
                  onClick={() => handleRemove(addition.id)}
                  className="flex items-center justify-center w-9 h-9 rounded-lg border-2 border-red-200 bg-red-50 text-red-400 hover:bg-red-100 hover:border-red-300 hover:text-red-600 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {additions.length > 0 && (
        <div className="mt-3 text-xs text-gray-600 flex items-start gap-2 bg-blue-50 p-3 rounded-lg border border-blue-200">
          <svg
            className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <strong className="text-blue-800">Nota:</strong> Los agregados se
            aplican a <strong>todas</strong> las cuotas generadas. Los de tipo{" "}
            <span className="font-semibold text-orange-600">Vencimiento</span>{" "}
            aparecerán como recargo en el ticket PDF (Total 1 sin recargo /
            Total 2 con recargo).
          </div>
        </div>
      )}
    </section>
  );
};
