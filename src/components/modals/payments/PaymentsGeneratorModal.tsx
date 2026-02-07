import React, { useState, useMemo } from "react";
import {
  X,
  Calendar,
  Users,
  DollarSign,
  AlertTriangle,
  Eye,
} from "lucide-react";
import { Member } from "../../../lib/types/member";
import { Sport } from "../../../lib/types/sport";
import { GenerationConfig } from "../../../lib/types/quote";

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

  const months = [
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

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() + i,
  );

  const filteredMembers = useMemo(() => {
    if (memberSelection === "all") {
      return members;
    }
    if (memberSelection === "by-sport" && config.selectedSports.length > 0) {
      return members.filter((member) =>
        member.sports?.some((sport) =>
          config.selectedSports.includes(sport.id),
        ),
      );
    }
    if (memberSelection === "individual") {
      return members.filter((member) =>
        config.selectedMembers.includes(member.id),
      );
    }
    return [];
  }, [members, memberSelection, config.selectedSports, config.selectedMembers]);

  const previewData = useMemo(() => {
    let onlySocietaryCount = 0;
    let onlySocietaryAmount = 0;
    let principalSportsCount = 0;
    let principalSportsAmount = 0;
    let secondarySportsCount = 0;
    let secondarySportsAmount = 0;

    filteredMembers.forEach((member) => {
      const memberSports =
        member.sports?.filter(
          (sport) =>
            config.selectedSports.length === 0 ||
            config.selectedSports.includes(sport.id),
        ) || [];

      // Socio SIN disciplinas seleccionadas
      if (
        memberSports.length === 0 &&
        config.includeSocietary &&
        member.societary_cuote
      ) {
        onlySocietaryCount++;
        onlySocietaryAmount += Number(member.societary_cuote.price);
      }

      // Socio CON disciplinas
      else if (memberSports.length > 0) {
        memberSports.forEach((sport) => {
          const isPrincipal = sport.isPrincipal; // Necesitas este campo en el tipo Sport
          const customAmount = config.customAmounts[`${member.id}-${sport.id}`];
          const sportAmount = customAmount || sport.quotes?.[0]?.price || 0;

          if (
            isPrincipal &&
            config.includeSocietary &&
            member.societary_cuote
          ) {
            // Disciplina principal: incluye cuota societaria
            principalSportsCount++;
            principalSportsAmount +=
              Number(sportAmount) + Number(member.societary_cuote.price);
          } else {
            // Disciplina secundaria: solo cuota deportiva
            secondarySportsCount++;
            secondarySportsAmount += Number(sportAmount);
          }
        });
      }
    });

    const totalPayments =
      onlySocietaryCount + principalSportsCount + secondarySportsCount;
    const totalAmount =
      onlySocietaryAmount + principalSportsAmount + secondarySportsAmount;

    return {
      onlySocietaryCount,
      onlySocietaryAmount,
      principalSportsCount,
      principalSportsAmount,
      secondarySportsCount,
      secondarySportsAmount,
      totalPayments,
      totalAmount,
      breakdown: filteredMembers.map((member) => {
        const memberSports =
          member.sports?.filter(
            (sport) =>
              config.selectedSports.length === 0 ||
              config.selectedSports.includes(sport.id),
          ) || [];

        const payments = [];

        // Sin disciplinas: solo societaria
        if (
          memberSports.length === 0 &&
          config.includeSocietary &&
          member.societary_cuote
        ) {
          payments.push({
            type: "societary" as const,
            amount: member.societary_cuote.price,
            description: "Cuota Societaria",
          });
        }

        // Con disciplinas
        memberSports.forEach((sport) => {
          const customAmount = config.customAmounts[`${member.id}-${sport.id}`];
          const sportAmount = customAmount || sport.quotes?.[0]?.price || 0;

          if (
            sport.isPrincipal &&
            config.includeSocietary &&
            member.societary_cuote
          ) {
            payments.push({
              type: "principal-sport" as const,
              amount:
                Number(sportAmount) + Number(member.societary_cuote.price),
              description: `${sport.name} (Principal + Societaria)`,
              breakdown: {
                sport: Number(sportAmount),
                societary: Number(member.societary_cuote.price),
              },
            });
          } else {
            payments.push({
              type: "secondary-sport" as const,
              amount: Number(sportAmount),
              description: `${sport.name}`,
            });
          }
        });

        return { member, payments };
      }),
    };
  }, [filteredMembers, config]);

  const handleMemberSelectionChange = (
    type: "all" | "by-sport" | "individual",
  ) => {
    setMemberSelection(type);
    setConfig((prev) => ({
      ...prev,
      selectedMembers: type === "individual" ? prev.selectedMembers : [],
      selectedSports: type === "by-sport" ? prev.selectedSports : [],
    }));
  };

  const handleMemberToggle = (memberId: number) => {
    setConfig((prev) => ({
      ...prev,
      selectedMembers: prev.selectedMembers.includes(memberId)
        ? prev.selectedMembers.filter((id) => id !== memberId)
        : [...prev.selectedMembers, memberId],
    }));
  };

  const handleSportToggle = (sportId: number) => {
    setConfig((prev) => ({
      ...prev,
      selectedSports: prev.selectedSports.includes(sportId)
        ? prev.selectedSports.filter((id) => id !== sportId)
        : [...prev.selectedSports, sportId],
    }));
  };

  const handleCustomAmountChange = (
    memberId: number,
    sportId: number,
    amount: number,
  ) => {
    const key = `${memberId}-${sportId}`;
    setConfig((prev) => {
      const newCustomAmounts = { ...prev.customAmounts };
      if (amount) {
        newCustomAmounts[key] = amount;
      } else {
        delete newCustomAmounts[key];
      }
      return {
        ...prev,
        customAmounts: newCustomAmounts,
      };
    });
  };

  const handleGenerate = async () => {
    try {
      await onGenerate(config);
      onClose();
      // Reset form
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
        <div className="sticky top-0 bg-[#1a1a1a] text-white p-6 flex justify-between items-center">
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
                        setConfig((prev) => ({
                          ...prev,
                          month: parseInt(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
                    >
                      {months.map((month, index) => (
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
                        setConfig((prev) => ({
                          ...prev,
                          year: parseInt(e.target.value),
                        }))
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

              <section>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#1a1a1a]" />
                  Selección de Socios
                </h3>

                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4">
                    <label
                      className="flex items-center gap-2 cursor-pointer p-3 border-2 rounded-lg transition-colors hover:bg-gray-50"
                      style={{
                        borderColor:
                          memberSelection === "all" ? "#1a1a1a" : "#e5e7eb",
                        backgroundColor:
                          memberSelection === "all" ? "#f9fafb" : "white",
                      }}
                    >
                      <input
                        type="radio"
                        checked={memberSelection === "all"}
                        onChange={() => handleMemberSelectionChange("all")}
                        className="w-4 h-4 text-[#1a1a1a] focus:ring-[#1a1a1a]"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Todos los socios
                      </span>
                    </label>

                    <label
                      className="flex items-center gap-2 cursor-pointer p-3 border-2 rounded-lg transition-colors hover:bg-gray-50"
                      style={{
                        borderColor:
                          memberSelection === "by-sport"
                            ? "#1a1a1a"
                            : "#e5e7eb",
                        backgroundColor:
                          memberSelection === "by-sport" ? "#f9fafb" : "white",
                      }}
                    >
                      <input
                        type="radio"
                        checked={memberSelection === "by-sport"}
                        onChange={() => handleMemberSelectionChange("by-sport")}
                        className="w-4 h-4 text-[#1a1a1a] focus:ring-[#1a1a1a]"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Por disciplina
                      </span>
                    </label>

                    <label
                      className="flex items-center gap-2 cursor-pointer p-3 border-2 rounded-lg transition-colors hover:bg-gray-50"
                      style={{
                        borderColor:
                          memberSelection === "individual"
                            ? "#1a1a1a"
                            : "#e5e7eb",
                        backgroundColor:
                          memberSelection === "individual"
                            ? "#f9fafb"
                            : "white",
                      }}
                    >
                      <input
                        type="radio"
                        checked={memberSelection === "individual"}
                        onChange={() =>
                          handleMemberSelectionChange("individual")
                        }
                        className="w-4 h-4 text-[#1a1a1a] focus:ring-[#1a1a1a]"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Selección individual
                      </span>
                    </label>
                  </div>

                  {memberSelection === "by-sport" && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Seleccione las disciplinas
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {sports.map((sport) => (
                          <label
                            key={sport.id}
                            className="flex items-center gap-2 cursor-pointer p-3 border border-gray-200 rounded-md hover:bg-white transition-colors bg-white"
                          >
                            <input
                              type="checkbox"
                              checked={config.selectedSports.includes(sport.id)}
                              onChange={() => handleSportToggle(sport.id)}
                              className="w-4 h-4 text-[#1a1a1a] focus:ring-[#1a1a1a]"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              {sport.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {memberSelection === "individual" && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Seleccione los socios
                      </label>
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {members.map((member) => (
                          <label
                            key={member.id}
                            className="flex items-center gap-2 cursor-pointer p-3 border border-gray-200 rounded-md hover:bg-white transition-colors bg-white"
                          >
                            <input
                              type="checkbox"
                              checked={config.selectedMembers.includes(
                                member.id,
                              )}
                              onChange={() => handleMemberToggle(member.id)}
                              className="w-4 h-4 text-[#1a1a1a] focus:ring-[#1a1a1a]"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              {member.name} {member.second_name}
                            </span>
                            <span className="text-xs text-gray-500 ml-auto">
                              DNI: {member.dni}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>

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
                        setConfig((prev) => ({
                          ...prev,
                          includeSocietary: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-[#1a1a1a] focus:ring-[#1a1a1a]"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Incluir cuotas societarias
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
                      setConfig((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
                    rows={3}
                    placeholder="Ingrese notas adicionales para esta generación..."
                  />
                </div>
              </section>

              {filteredMembers.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold mb-4">
                    Montos Personalizados (opcional)
                  </h3>
                  <div className="max-h-80 overflow-y-auto bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
                    {filteredMembers.map((member) => (
                      <div
                        key={member.id}
                        className="bg-white rounded-lg p-4 border border-gray-200"
                      >
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          {member.name} {member.second_name}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {member.sports
                            ?.filter(
                              (sport) =>
                                config.selectedSports.length === 0 ||
                                config.selectedSports.includes(sport.id),
                            )
                            .map((sport) => (
                              <div
                                key={sport.id}
                                className="flex flex-col gap-1"
                              >
                                <label className="text-xs font-medium text-gray-600">
                                  {sport.name}
                                </label>
                                <input
                                  type="number"
                                  placeholder={`Predeterminado: $${sport.quotes?.[0]?.price || "0"}`}
                                  value={
                                    config.customAmounts[
                                      `${member.id}-${sport.id}`
                                    ] || ""
                                  }
                                  onChange={(e) =>
                                    handleCustomAmountChange(
                                      member.id,
                                      sport.id,
                                      parseFloat(e.target.value),
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
                    ))}
                  </div>
                </section>
              )}

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

              <section>
                <h4 className="text-lg font-semibold mb-4">Resumen General</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <p className="text-xs font-medium text-blue-600">
                        Período
                      </p>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {months[config.month - 1]} {config.year}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <p className="text-xs font-medium text-green-600">
                        Total de Cuotas
                      </p>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {previewData.totalPayments}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-yellow-600" />
                      <p className="text-xs font-medium text-yellow-600">
                        Monto Total
                      </p>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(previewData.totalAmount)}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-purple-600" />
                      <p className="text-xs font-medium text-purple-600">
                        Socios Afectados
                      </p>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {filteredMembers.length}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Cuotas Societarias
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {previewData.onlySocietaryCount}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(previewData.onlySocietaryAmount)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Socios sin disciplinas
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-green-100 border-2">
                    <p className="text-sm font-medium text-green-600 mb-1">
                      Disciplinas Principales
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {previewData.principalSportsCount}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(previewData.principalSportsAmount)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Incluye cuota societaria
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Disciplinas Secundarias
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {previewData.secondarySportsCount}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(previewData.secondarySportsAmount)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Solo cuota deportiva
                    </p>
                  </div>
                </div>
              </section>

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

              <section>
                <h4 className="text-lg font-semibold mb-4">
                  Detalle por Socio
                </h4>
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-[#1a1a1a] sticky top-0">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#FFD700] uppercase tracking-wider">
                            Socio
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#FFD700] uppercase tracking-wider">
                            Cuotas
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#FFD700] uppercase tracking-wider">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {previewData.breakdown.map(({ member, payments }) => (
                          <tr
                            key={member.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {member.name} {member.second_name}
                              </div>
                              <div className="text-xs text-gray-500">
                                DNI: {member.dni}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                {payments.map((payment, index) => (
                                  <div
                                    key={index}
                                    className="text-sm flex items-center justify-between gap-2"
                                  >
                                    <span className="text-gray-700 font-medium">
                                      {payment.description}
                                    </span>
                                    <span className="text-gray-600 text-xs">
                                      {formatCurrency(payment.amount)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-base font-bold text-gray-900">
                                {formatCurrency(
                                  payments.reduce(
                                    (sum, p) => sum + Number(p.amount),
                                    0,
                                  ),
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

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
