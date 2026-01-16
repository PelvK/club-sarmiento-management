import React from 'react';
import { X, Calendar, DollarSign, User, Trophy, FileText, Tag } from 'lucide-react';
import { Payment } from '../../../lib/types/payment';

interface PaymentDetailsModalProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({
  payment,
  isOpen,
  onClose
}) => {
  if (!payment) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagado';
      case 'pending': return 'Pendiente';
      case 'overdue': return 'Vencido';
      case 'partial': return 'Parcialmente Pagado';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      case 'partial': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPaidAmount = () => {
    if (payment.status === 'paid') return payment.amount;
    if (payment.status === 'partial') {
      return payment.partialPayments?.reduce((sum, pp) => sum + pp.amount, 0) || 0;
    }
    return 0;
  };

  const getRemainingAmount = () => {
    return payment.amount - getPaidAmount();
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Detalles de la Cuota</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-[#FFD700] mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Socio</p>
                  <p className="font-medium text-gray-900">{payment.memberName}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Trophy className="h-5 w-5 text-[#FFD700] mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Disciplina</p>
                  <p className="font-medium text-gray-900">{payment.sportName}</p>
                  <p className="text-xs text-gray-500 capitalize">{payment.type}</p>
                </div>
              </div>

              <div className="flex items-center">
                <FileText className="h-5 w-5 text-[#FFD700] mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Tipo de Cuota</p>
                  <p className="font-medium text-gray-900">{payment.quoteName}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-[#FFD700] mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Monto Total</p>
                  <p className="font-medium text-gray-900">{formatCurrency(payment.amount)}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-[#FFD700] mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Fecha de Vencimiento</p>
                  <p className="font-medium text-gray-900">{formatDate(payment.dueDate)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Estado</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>
                  {getStatusText(payment.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Status Details */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Estado del Pago</h3>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Monto Pagado</p>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(getPaidAmount())}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Monto Pendiente</p>
                  <p className="text-lg font-semibold text-red-600">
                    {formatCurrency(getRemainingAmount())}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Progreso</p>
                  <div className="mt-1">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(getPaidAmount() / payment.amount) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {Math.round((getPaidAmount() / payment.amount) * 100)}% completado
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Partial Payments History */}
          {payment.partialPayments && payment.partialPayments.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Historial de Pagos Parciales</h3>
              
              <div className="space-y-3">
                {payment.partialPayments.map((partialPayment) => (
                  <div key={partialPayment.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {formatCurrency(partialPayment.amount)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(partialPayment.paidDate)}
                        </p>
                        {partialPayment.notes && (
                          <p className="text-sm text-gray-600 mt-1">
                            {partialPayment.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Date */}
          {payment.paidDate && (
            <div className="border-t pt-6">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Fecha de Pago Completo</p>
                  <p className="font-medium text-gray-900">{formatDate(payment.paidDate)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          {payment.tags && payment.tags.length > 0 && (
            <div className="border-t pt-6">
              <div className="flex items-center mb-3">
                <Tag className="h-5 w-5 text-[#FFD700] mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Etiquetas</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {payment.tags.map((tag, index) => (
                  <span key={index} className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {payment.notes && (
            <div className="border-t pt-6">
              <div className="flex items-center mb-3">
                <FileText className="h-5 w-5 text-[#FFD700] mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Notas</h3>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">{payment.notes}</p>
              </div>
            </div>
          )}

          {/* Generation Info */}
          {payment.generationId && (
            <div className="border-t pt-6">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-[#FFD700] mr-2" />
                <div>
                  <p className="text-sm text-gray-500">ID de Generación</p>
                  <p className="font-medium text-gray-900">{payment.generationId}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};