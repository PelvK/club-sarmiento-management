import React from "react";
import { FAMILY_STATUS } from "../../../lib/enums/SportSelection";
import { PreviewData } from "./types";

interface MemberDetailTableProps {
  previewData: PreviewData;
  formatCurrency: (amount: number) => string;
}

export const MemberDetailTable: React.FC<MemberDetailTableProps> = ({
  previewData,
  formatCurrency,
}) => {
  return (
    <section>
      <h4 className="text-lg font-semibold mb-4">Detalle por Socio</h4>
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
              {previewData.breakdown.map(({ member, payments, totalAmount }) => (
                <tr
                  key={member.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {member.name} {member.second_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          DNI: {member.dni}
                        </div>
                      </div>
                      {member.familyGroupStatus === FAMILY_STATUS.HEAD && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded whitespace-nowrap">
                          Cabeza de Familia
                        </span>
                      )}
                      {member.familyGroupStatus === FAMILY_STATUS.MEMBER && (
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded whitespace-nowrap">
                          Miembro
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      {payments.map((payment, index) => (
                        <div key={index} className="text-sm">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-gray-700 font-medium">
                              {payment.description}
                            </span>
                            <span className="text-gray-600 text-xs font-semibold">
                              {formatCurrency(payment.amount)}
                            </span>
                          </div>

                          {/* Mostrar breakdown de dependientes si existe */}
                          {payment.breakdown &&
                            payment.breakdown.dependents.length > 0 && (
                              <div className="mt-2 ml-4 pl-4 border-l-2 border-blue-200 space-y-1">
                                <div className="text-xs text-gray-600">
                                  <span className="font-medium">
                                    Titular ({member.name}):
                                  </span>{" "}
                                  {formatCurrency(
                                    payment.breakdown.headSocietary +
                                      payment.breakdown.headSport
                                  )}
                                </div>
                                {payment.breakdown.dependents.map((dep) => (
                                  <div
                                    key={dep.memberId}
                                    className="text-xs text-gray-600"
                                  >
                                    <span className="font-medium">
                                      {dep.memberName}:
                                    </span>{" "}
                                    {formatCurrency(
                                      dep.societaryAmount + dep.sportAmount
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-base font-bold text-gray-900">
                      {formatCurrency(totalAmount)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};