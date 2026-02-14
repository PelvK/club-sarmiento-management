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
      const payments = await paymentsApi.getByGenerationId({generationId});
      setPayments(payments);
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
      'societary-only': 'bg-blue-50 text-blue-700 border-blue-300',
      'principal-sport': 'bg-green-50 text-green-700 border-green-300',
      'secondary-sport': 'bg-orange-50 text-orange-700 border-orange-300'
    };
    return classes[type] || 'bg-gray-50 text-gray-700 border-gray-300';
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
      'pending': 'bg-yellow-50 text-yellow-700 border-yellow-300',
      'partial': 'bg-orange-50 text-orange-700 border-orange-300',
      'paid': 'bg-green-50 text-green-700 border-green-300',
      'cancelled': 'bg-red-50 text-red-700 border-red-300'
    };
    return classes[status] || 'bg-gray-50 text-gray-700 border-gray-300';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 opacity-100 transition-opacity duration-300">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col overflow-hidden opacity-100 transform scale-100 transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-[#1a1a1a] to-black px-6 py-5 rounded-t-xl flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[#d4d4d4] tracking-wide flex items-center gap-2">
              <Calendar className="w-6 h-6 text-[#FFD700]" />
              Detalle de Generación
            </h2>
            <p className="text-sm text-[#a3a3a3] mt-1">
              {getMonthName(generationMonth)} {generationYear} • ID: {generationId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 text-[#d4d4d4] hover:bg-[#FFD700]/20 hover:text-[#FFD700] hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#f8f9fa]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700]"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 inline-block">
                <p className="text-red-600 font-semibold">{error}</p>
              </div>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 border-2 border-gray-200 rounded-xl p-6 inline-block">
                <p className="text-gray-500 font-medium">No hay cuotas en esta generación</p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-blue-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700 font-bold uppercase tracking-wide mb-1">Total Cuotas</p>
                      <p className="text-3xl font-black text-blue-900">{payments.length}</p>
                    </div>
                    <div className="bg-blue-200/50 p-3 rounded-lg">
                      <Calendar className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border-2 border-green-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700 font-bold uppercase tracking-wide mb-1">Monto Total</p>
                      <p className="text-3xl font-black text-green-900">
                        {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
                      </p>
                    </div>
                    <div className="bg-green-200/50 p-3 rounded-lg">
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-orange-100 rounded-xl p-5 border-2 border-yellow-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-700 font-bold uppercase tracking-wide mb-1">Monto Pagado</p>
                      <p className="text-3xl font-black text-yellow-900">
                        {formatCurrency(payments.reduce((sum, p) => sum + (p.paidAmount || 0), 0))}
                      </p>
                    </div>
                    <div className="bg-yellow-200/50 p-3 rounded-lg">
                      <DollarSign className="h-8 w-8 text-yellow-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* PDF Generation Error */}
              {pdfError && (
                <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 shadow-sm">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-semibold text-red-800">{pdfError}</p>
                  </div>
                </div>
              )}

              {/* Payments Table */}
              <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y-2 divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
                      <tr>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                          Socio
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                          Descripción
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                          Monto
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                          Pagado
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm font-bold text-gray-900">#{payment.id}</span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="bg-gray-100 p-1.5 rounded-lg">
                                <User className="h-4 w-4 text-gray-600" />
                              </div>
                              <div className="text-sm text-gray-900">
                                { payment.member && payment.member.name + " "+  payment.member.second_name || `Socio #${payment.member.id}`}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold border-2 ${getTypeBadgeClass(payment.type)}`}>
                              <Tag className="h-3 w-3 mr-1.5" />
                              {getTypeLabel(payment.type)}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {payment.description}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm font-bold text-gray-900">
                              {formatCurrency(payment.amount)}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-gray-600">
                              {formatCurrency(payment.paidAmount || 0)}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold border-2 ${getStatusBadgeClass(payment.status)}`}>
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
        <div className="flex items-center justify-between gap-3 bg-white px-6 py-4 border-t-2 border-gray-200 flex-shrink-0">
          <button
            onClick={handleGeneratePdf}
            disabled={isGenerating || loading || payments.length === 0}
            className="inline-flex items-center px-6 py-3 bg-[#FFD700] text-[#1a1a1a] rounded-lg semiboldfont- shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#1a1a1a] mr-2"></div>
                Generando PDF...
              </>
            ) : (
              <>
                <Download className="h-5 w-5 mr-2" />
                Descargar Tickets PDF
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-6 py-3 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
