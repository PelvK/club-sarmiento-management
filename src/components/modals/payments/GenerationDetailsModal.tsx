import React, { useEffect, useState } from 'react';
import { X, Calendar, User, DollarSign, Tag, Download } from 'lucide-react';
import { Payment } from '../../../lib/types';
import { paymentsApi } from '../../../lib/api/payments';
import { usePaymentTicketPdf } from '../../../hooks/usePaymentsGenerationPdf';

interface GenerationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  generationId: string;
  generationMonth: number;
  generationYear: number;
}

export const GenerationDetailsModal: React.FC<GenerationDetailsModalProps> = ({
  isOpen,
  onClose,
  generationId,
  generationMonth,
  generationYear
}) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { generatePdf, isGenerating, error: pdfError } = usePaymentTicketPdf();

  useEffect(() => {
    if (isOpen && generationId) {
      loadPayments();
    }
  }, [isOpen, generationId]);

  const loadPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const allPayments = await paymentsApi.getAll();
      const filtered = allPayments.filter(p => p.generationId === generationId);
      setPayments(filtered);
    } catch (err) {
      setError('Error al cargar las cuotas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePdf = async () => {
    try {
      await generatePdf({
        payments,
        generationId,
        generationMonth,
        generationYear
      });
    } catch (err) {
      console.error('Error generating PDF:', err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getMonthName = (month: number) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1];
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'societary-only': 'Solo Societaria',
      'principal-sport': 'Deporte Principal',
      'secondary-sport': 'Deporte Secundario'
    };
    return labels[type] || type;
  };

  const getTypeBadgeClass = (type: string) => {
    const classes: Record<string, string> = {
      'societary-only': 'bg-blue-100 text-blue-800',
      'principal-sport': 'bg-green-100 text-green-800',
      'secondary-sport': 'bg-purple-100 text-purple-800'
    };
    return classes[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'pending': 'Pendiente',
      'partial': 'Parcial',
      'paid': 'Pagado',
      'cancelled': 'Cancelado'
    };
    return labels[status] || status;
  };

  const getStatusBadgeClass = (status: string) => {
    const classes: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'partial': 'bg-orange-100 text-orange-800',
      'paid': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Detalle de Generación
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {getMonthName(generationMonth)} {generationYear} - ID: {generationId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700]"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay cuotas en esta generación</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Total Cuotas</p>
                      <p className="text-2xl font-bold text-blue-900">{payments.length}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-400" />
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Monto Total</p>
                      <p className="text-2xl font-bold text-green-900">
                        {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-400" />
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-600 font-medium">Monto Pagado</p>
                      <p className="text-2xl font-bold text-yellow-900">
                        {formatCurrency(payments.reduce((sum, p) => sum + (p.paidAmount || 0), 0))}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-yellow-400" />
                  </div>
                </div>
              </div>

              {/* PDF Generation Error */}
              {pdfError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-red-800">{pdfError}</p>
                </div>
              )}

              {/* Payments Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Socio
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Descripción
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Monto
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pagado
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            #{payment.id}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <User className="h-4 w-4 text-gray-400 mr-2" />
                              <div className="text-sm text-gray-900">
                                { payment.member && payment.member.name + " "+  payment.member.second_name || `Socio #${payment.member.id}`}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeClass(payment.type)}`}>
                              <Tag className="h-3 w-3 mr-1" />
                              {getTypeLabel(payment.type)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {payment.description}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {formatCurrency(payment.paidAmount || 0)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(payment.status)}`}>
                              {getStatusLabel(payment.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <button
            onClick={handleGeneratePdf}
            disabled={isGenerating || loading || payments.length === 0}
            className="inline-flex items-center px-4 py-2 bg-[#FFD700] text-gray-900 rounded-md text-sm font-medium hover:bg-[#F5C400] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFD700] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                Generando PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Descargar Tickets PDF
              </>
            )}
          </button>
          
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFD700]"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
