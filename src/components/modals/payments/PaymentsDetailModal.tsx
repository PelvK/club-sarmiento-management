import React, { useState } from 'react';
import { X, Calendar, DollarSign, User, Trophy, FileText, Tag, CheckCircle, Ban, Loader2 } from 'lucide-react';
import { Payment } from '../../../lib/types/payment';
import { paymentsApi } from '../../../lib/api/payments';
import { useAuth } from '../../../hooks/useAuth';

interface PaymentDetailsModalProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({
  payment,
  isOpen,
  onClose,
  onUpdate
}) => {
  const { user } = useAuth();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

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

  const handleMarkAsPaid = async () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Por favor ingrese un monto válido');
      return;
    }

    const remainingAmount = getRemainingAmount();
    if (amount > remainingAmount) {
      alert(`El monto no puede ser mayor al saldo pendiente (${formatCurrency(remainingAmount)})`);
      return;
    }

    setActionLoading(true);
    try {
      await paymentsApi.markAsPaid(payment.id, amount);
      if (onUpdate) await onUpdate();
      setShowPaymentForm(false);
      setPaymentAmount('');
      alert('Pago registrado exitosamente');
    } catch (err) {
      console.error('Error marking payment as paid:', err);
      alert('Error al registrar el pago');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelPayment = async () => {
    if (!window.confirm('¿Está seguro que desea cancelar esta cuota? Esta acción no se puede deshacer.')) {
      return;
    }

    setActionLoading(true);
    try {
      const updatedPayment = {
        ...payment,
        status: 'cancelled' as const
      };
      await paymentsApi.updatePayment(updatedPayment);
      if (onUpdate) await onUpdate();
      alert('Cuota cancelada exitosamente');
      onClose();
    } catch (err) {
      console.error('Error cancelling payment:', err);
      alert('Error al cancelar la cuota');
    } finally {
      setActionLoading(false);
    }
  };

  const openPaymentForm = () => {
    setPaymentAmount(getRemainingAmount().toString());
    setShowPaymentForm(true);
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

        {/* Payment Form */}
        {showPaymentForm && (
          <div className="border-t pt-6">
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-bold text-green-900">Registrar Pago</h3>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Monto a Pagar
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-sm font-semibold"
                  placeholder="Ingrese el monto"
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Puede registrar un pago parcial o el total pendiente
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleMarkAsPaid}
                  disabled={actionLoading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-all disabled:opacity-50"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Confirmar Pago
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowPaymentForm(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-6 gap-3">
          <div className="flex gap-3">
            {user?.permissions?.can_edit && !showPaymentForm && payment.status !== 'paid' && payment.status !== 'cancelled' && (
              <button
                onClick={openPaymentForm}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-all disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                Registrar Pago
              </button>
            )}
            {user?.permissions?.can_delete && payment.status !== 'cancelled' && (
              <button
                onClick={handleCancelPayment}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-all disabled:opacity-50"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cancelando...
                  </>
                ) : (
                  <>
                    <Ban className="w-4 h-4" />
                    Cancelar Cuota
                  </>
                )}
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={actionLoading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
