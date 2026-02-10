import React from 'react';

interface MemberDetailTableProps {
  previewData: any;
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
              {previewData.breakdown.map(({ member, payments }: any) => (
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
                    <div className="space-y-3">
                      {payments.map((payment: any, paymentIndex: number) => (
                        <div key={paymentIndex} className="space-y-1">
                          <div className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-1">
                            {payment.description}
                          </div>

                          {/* Si tiene breakdown, mostrar items */}
                          {payment.breakdown ? (
                            <div className="pl-3 space-y-1">
                              {payment.breakdown.items.map(
                                (item: any, itemIndex: number) => (
                                  <div
                                    key={itemIndex}
                                    className="flex items-center justify-between text-xs"
                                  >
                                    <span className="text-gray-600">
                                      {item.type === 'sport' ? '🏃' : '👥'}{' '}
                                      {item.concept}
                                      {item.memberId !== member.id && (
                                        <span className="text-gray-400 ml-1">
                                          ({item.memberName})
                                        </span>
                                      )}
                                    </span>
                                    <span className="text-gray-700 font-medium">
                                      {formatCurrency(item.amount)}
                                    </span>
                                  </div>
                                )
                              )}
                              <div className="flex items-center justify-between text-xs font-bold text-gray-900 border-t border-gray-300 pt-1 mt-1">
                                <span>Subtotal</span>
                                <span>
                                  {formatCurrency(payment.breakdown.total)}
                                </span>
                              </div>
                            </div>
                          ) : (
                            // Sin breakdown, solo mostrar el monto
                            <div className="flex items-center justify-between text-xs pl-3">
                              <span className="text-gray-600">
                                {payment.description}
                              </span>
                              <span className="text-gray-700 font-medium">
                                {formatCurrency(payment.amount)}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-base font-bold text-gray-900">
                      {formatCurrency(
                        payments.reduce(
                          (sum: number, p: any) => sum + Number(p.amount),
                          0
                        )
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
  );
};