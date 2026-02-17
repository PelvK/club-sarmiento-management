import React from "react";
import { BreakdownItem, PreviewData } from "../../../lib/types/payment";
import { BREAKDOWN_TYPE } from "../../../lib/enums/PaymentStatus";
import { FAMILY_STATUS } from "../../../lib/enums/SportSelection";

interface MemberDetailTableProps {
  previewData: PreviewData;
  formatCurrency: (amount: number) => string;
}

interface InvolvedMember {
  id: number;
  name: string;
}

export const MemberDetailTable: React.FC<MemberDetailTableProps> = ({
  previewData,
  formatCurrency,
}) => {
  // Función para obtener socios involucrados en los pagos
  const getInvolvedMembers = (
    payments: PreviewData["breakdown"][0]["payments"]
  ): InvolvedMember[] => {
    const memberMap = new Map<number, string>();

    payments.forEach((payment) => {
      payment.breakdown.items.forEach((item: BreakdownItem) => {
        if (!memberMap.has(item.memberId)) {
          memberMap.set(item.memberId, item.memberName);
        }
      });
    });

    return Array.from(memberMap.entries()).map(([id, name]) => ({
      id,
      name,
    }));
  };

  // Función para obtener el ícono según el tipo de breakdown
  const getBreakdownIcon = (type: BREAKDOWN_TYPE) => {
    switch (type) {
      case BREAKDOWN_TYPE.SOCIETARY:
        return (
          <span className="w-5 h-5 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-xs">
            👥
          </span>
        );
      case BREAKDOWN_TYPE.PRINCIPAL_SPORT:
        return (
          <span className="w-5 h-5 flex items-center justify-center bg-yellow-100 text-yellow-600 rounded-full text-xs">
            ⭐
          </span>
        );
      case BREAKDOWN_TYPE.SECONDARY_SPORT:
        return (
          <span className="w-5 h-5 flex items-center justify-center bg-green-100 text-green-600 rounded-full text-xs">
            🏃
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xl font-bold text-gray-900">Detalle por Socio</h4>
        <span className="text-sm text-gray-500">
          {previewData.breakdown.length}{" "}
          {previewData.breakdown.length === 1 ? "socio" : "socios"}
        </span>
      </div>

      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
        <div className="max-h-[600px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-900 to-gray-800 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#FFD700] uppercase tracking-wider">
                  Socio Pagador
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#FFD700] uppercase tracking-wider">
                  Socios Involucrados
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#FFD700] uppercase tracking-wider">
                  Detalle de Cuotas
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-[#FFD700] uppercase tracking-wider">
                  Total a Pagar
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {previewData.breakdown.map(
                ({ member, payments, totalAmount }) => {
                  const involvedMembers = getInvolvedMembers(payments);

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-gray-50 transition-all duration-150"
                    >
                      {/* Columna: Socio Pagador */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {member.name.charAt(0)}
                            {member.second_name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {member.name} {member.second_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              DNI: {member.dni}
                            </div>
                            {member.familyGroupStatus === FAMILY_STATUS.HEAD && (
                              <span className="inline-flex items-center mt-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium border border-blue-200">
                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                </svg>
                                Cabeza de Familia
                              </span>
                            )}
                            {member.familyGroupStatus ===
                              FAMILY_STATUS.MEMBER && (
                              <span className="inline-flex items-center mt-1 text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full font-medium border border-gray-200">
                                Miembro
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Columna: Socios Involucrados */}
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-2">
                          {involvedMembers.length > 0 ? (
                            involvedMembers.map((involvedMember) => (
                              <span
                                key={involvedMember.id}
                                className="inline-flex items-center text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-medium border border-purple-200"
                              >
                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {involvedMember.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400 italic">
                              Solo el titular
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Columna: Detalle de Cuotas */}
                      <td className="px-6 py-5">
                        <div className="space-y-4">
                          {payments.map((payment, paymentIndex) => (
                            <div
                              key={paymentIndex}
                              className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                            >
                              {/* Título del payment */}
                              <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-300">
                                <span className="text-sm font-bold text-gray-800">
                                  {payment.description}
                                </span>
                                {payment.sportName && (
                                  <span className="text-xs text-gray-500 italic">
                                    {payment.sportName}
                                  </span>
                                )}
                              </div>

                              {/* Breakdown de items */}
                              <div className="space-y-2">
                                {payment.breakdown.items.map(
                                  (item, itemIndex) => (
                                    <div
                                      key={itemIndex}
                                      className="flex items-start justify-between gap-3 py-1"
                                    >
                                      <div className="flex items-start gap-2 flex-1 min-w-0">
                                        {/* Icono según tipo */}
                                        {getBreakdownIcon(item.type)}

                                        {/* Información del item */}
                                        <div className="flex-1 min-w-0">
                                          <div className="text-xs font-medium text-gray-700">
                                            {item.concept}
                                          </div>
                                          {item.description && (
                                            <div className="text-xs text-gray-500 mt-0.5">
                                              {item.description}
                                            </div>
                                          )}
                                          {/* Mostrar nombre si es de otro miembro */}
                                          {item.memberId !== member.id && (
                                            <div className="text-xs text-purple-600 mt-0.5 font-medium">
                                              → {item.memberName}
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Monto del item */}
                                      <span className="text-sm text-gray-900 font-semibold whitespace-nowrap">
                                        {formatCurrency(item.amount)}
                                      </span>
                                    </div>
                                  )
                                )}

                                {/* Subtotal del payment si tiene múltiples items */}
                                {payment.breakdown.items.length > 1 && (
                                  <div className="flex items-center justify-between pt-2 mt-2 border-t-2 border-gray-300">
                                    <span className="text-xs font-bold text-gray-900 uppercase">
                                      Subtotal{" "}
                                      {payment.sportName || "Cuota"}
                                    </span>
                                    <span className="text-sm font-bold text-gray-900">
                                      {formatCurrency(payment.breakdown.total)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Columna: Total a Pagar */}
                      <td className="px-6 py-5 whitespace-nowrap text-right">
                        <div className="inline-flex flex-col items-end bg-gradient-to-br from-green-50 to-green-100 px-4 py-3 rounded-lg border-2 border-green-200">
                          <span className="text-xs font-medium text-green-700 uppercase tracking-wide">
                            Total
                          </span>
                          <span className="text-xl font-bold text-green-900 mt-1">
                            {formatCurrency(totalAmount)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leyenda de íconos */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h5 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
          Leyenda de Conceptos
        </h5>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            {getBreakdownIcon(BREAKDOWN_TYPE.SOCIETARY)}
            <span className="text-xs text-gray-600">Cuota Societaria</span>
          </div>
          <div className="flex items-center gap-2">
            {getBreakdownIcon(BREAKDOWN_TYPE.PRINCIPAL_SPORT)}
            <span className="text-xs text-gray-600">Deporte Principal</span>
          </div>
          <div className="flex items-center gap-2">
            {getBreakdownIcon(BREAKDOWN_TYPE.SECONDARY_SPORT)}
            <span className="text-xs text-gray-600">Deporte Secundario</span>
          </div>
        </div>
      </div>
    </section>
  );
};
