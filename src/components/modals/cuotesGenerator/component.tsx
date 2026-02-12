import React, { useState, useMemo } from "react";
import { X, DollarSign, AlertTriangle, Eye } from "lucide-react";
import { Member } from "../../../lib/types/member";
import { Sport } from "../../../lib/types/sport";
import { GenerationConfig } from "../../../lib/types/quote";
import { usePaymentCalculation } from "../../../hooks/usePaymentCalculation";
import { PeriodSelector } from "./PeriodSelector";
import { MemberSelector } from "./MemberSelector";
import { GenerationOptions } from "./GenerationOptions";
import { CustomAmountsEditor } from "./CustomAmountEditor";
import { PreviewSummary } from "./PreviewSummary";
import { MemberDetailTable } from "./MemberDetailTable";

interface PaymentGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (config: GenerationConfig) => Promise<void>;
  members: Member[];
  sports: Sport[];
}

export const PaymentGeneratorModal: React.FC<PaymentGeneratorModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  members,
  sports,
}) => {
  const [config, setConfig] = useState<GenerationConfig>({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    includeSocietary: true,
    selectedMembers: [],
    selectedSports: [],
    notes: "",
    customAmounts: {},
    includeNonPrincipalSports: true,
  });

  const [showPreview, setShowPreview] = useState(false);
  const [memberSelection, setMemberSelection] = useState<
    "all" | "by-sport" | "individual"
  >("all");

  const filteredMembers = useMemo(() => {
    if (memberSelection === "all") {
      return members;
    }
    if (memberSelection === "by-sport" && config.selectedSports.length > 0) {
      return members.filter((member) =>
        member.sports?.some((sport) =>
          config.selectedSports.includes(sport.id)
        )
      );
    }
    if (memberSelection === "individual") {
      return members.filter((member) =>
        config.selectedMembers.includes(member.id)
      );
    }
    return [];
  }, [members, memberSelection, config.selectedSports, config.selectedMembers]);

  const previewData = usePaymentCalculation(filteredMembers, config);

  const handleMemberSelectionChange = (
    type: "all" | "by-sport" | "individual"
  ) => {
    setMemberSelection(type);
    setConfig((prev) => ({
      ...prev,
      selectedMembers: type === "individual" ? prev.selectedMembers : [],
      selectedSports: type === "by-sport" ? prev.selectedSports : [],
    }));
  };

  const handleGenerate = async () => {
    try {
      await onGenerate(config);
      onClose();
      setConfig({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        includeSocietary: true,
        selectedMembers: [],
        selectedSports: [],
        notes: "",
        customAmounts: {},
        includeNonPrincipalSports: true,
      });
      setMemberSelection("all");
      setShowPreview(false);
    } catch (error) {
      console.error("Error generating payments:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#1a1a1a] text-white p-6 flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-[#FFD700]" />
            <h2 className="text-xl font-semibold">Generador de Cuotas</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-[#FFD700] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {!showPreview ? (
            <div className="space-y-6">
              <PeriodSelector config={config} onConfigChange={setConfig} />

              <MemberSelector
                memberSelection={memberSelection}
                onMemberSelectionChange={handleMemberSelectionChange}
                config={config}
                onConfigChange={setConfig}
                members={members}
                sports={sports}
              />

              <GenerationOptions
                config={config}
                onConfigChange={setConfig}
              />

              <CustomAmountsEditor
                filteredMembers={filteredMembers}
                config={config}
                onConfigChange={setConfig}
              />

              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setShowPreview(true)}
                  className="flex-1 px-4 py-2 bg-[#1a1a1a] text-white rounded-md hover:bg-[#2a2a2a] transition-colors flex items-center justify-center gap-2"
                  disabled={filteredMembers.length === 0}
                >
                  <Eye className="w-4 h-4" />
                  Vista Previa
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[#1a1a1a]" />
                  Vista Previa de Generación
                </h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-[#1a1a1a] hover:text-[#2a2a2a] font-medium transition-colors flex items-center gap-1"
                >
                  <span>← Volver</span>
                </button>
              </div>

              <PreviewSummary
                previewData={previewData}
                month={config.month}
                year={config.year}
                filteredMembersCount={filteredMembers.length}
                formatCurrency={formatCurrency}
              />

              <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-yellow-800 mb-1">
                      Confirmación requerida
                    </h4>
                    <p className="text-sm text-yellow-700">
                      Esta acción generará{" "}
                      <strong>{previewData.totalPayments}</strong> nuevas cuotas
                      por un total de{" "}
                      <strong>{formatCurrency(previewData.totalAmount)}</strong>
                      . Esta operación no se puede deshacer automáticamente.
                    </p>
                  </div>
                </div>
              </div>

              <MemberDetailTable
                previewData={previewData}
                formatCurrency={formatCurrency}
              />

              <div className="flex gap-3 pt-6 border-t">
                <button
                  onClick={() => setShowPreview(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Modificar Configuración
                </button>
                <button
                  onClick={handleGenerate}
                  className="flex-1 px-4 py-2 bg-[#1a1a1a] text-white rounded-md hover:bg-[#2a2a2a] transition-colors font-semibold"
                >
                  Confirmar y Generar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};