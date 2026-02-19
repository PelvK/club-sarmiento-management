import React, { useEffect, useState } from "react";
import {
  X,
  Calendar,
  User,
  DollarSign,
  Tag,
  Download,
  CheckCircle,
  Ban,
  Loader2,
} from "lucide-react";
import { Payment } from "../../../lib/types";
import { paymentsApi } from "../../../lib/api/payments";
import { usePaymentTicketPdf } from "../../../hooks/usePaymentsGenerationPdf";
import { useAuth } from "../../../hooks/useAuth";
import { usePayments } from "../../../hooks/usePayments";

interface GenerationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  generationId: string;
  generationMonth: number;
  generationYear: number;
  onUpdate?: () => void;
}

interface PaymentActionModal {
  payment: Payment | null;
  action: "pay" | "cancel" | null;
}

export const GenerationDetailsModal: React.FC<GenerationDetailsModalProps> = ({
  isOpen,
  onClose,
  generationId,
  generationMonth,
  generationYear,
  onUpdate,
}) => {
  const { user } = useAuth();
  const { markAsPaid, cancelPayment } = usePayments();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [actionModal, setActionModal] = useState<PaymentActionModal>({
    payment: null,
    action: null,
  });
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [actionLoading, setActionLoading] = useState(false);
  const { generatePdf, isGenerating, error: pdfError } = usePaymentTicketPdf();

  useEffect(() => {
    if (isOpen && generationId) {
      loadPayments();
    }
  }, [isOpen, generationId]);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  const loadPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const payments = await paymentsApi.getByGenerationId({ generationId });
      setPayments(payments);
    } catch (err) {
      setError("Error al cargar las cuotas");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePdf = async () => {
    try {
      await generatePdf({
        payments: payments.filter((p) => isChecked || p.status !== "cancelled"),
        generationId,
        generationMonth,
        generationYear,
      });
    } catch (err) {
      console.error("Error generating PDF:", err);
    }
  };

  const openPaymentModal = (payment: Payment) => {
    setActionModal({ payment, action: "pay" });
    setPaymentAmount((payment.amount - payment.paidAmount).toString());
  };

  const openCancelModal = (payment: Payment) => {
    setActionModal({ payment, action: "cancel" });
  };

  const closeActionModal = () => {
    setActionModal({ payment: null, action: null });
    setPaymentAmount("");
  };

  const handleMarkAsPaid = async () => {
    if (!actionModal.payment) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Por favor ingrese un monto válido");
      return;
    }

    const remainingAmount =
      actionModal.payment.amount - actionModal.payment.paidAmount;
    if (amount > remainingAmount) {
      alert(
        `El monto no puede ser mayor al saldo pendiente (${formatCurrency(remainingAmount)})`,
      );
      return;
    }

    setActionLoading(true);
    try {
      await markAsPaid(actionModal.payment.id, amount);
      await loadPayments();
      if (onUpdate) await onUpdate();
      closeActionModal();
    } catch (err) {
      console.error("Error marking payment as paid:", err);
      alert("Error al registrar el pago");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelPayment = async () => {
    if (!actionModal.payment) return;

    setActionLoading(true);
    try {
      await cancelPayment(actionModal.payment.id);
      await loadPayments();
      if (onUpdate) await onUpdate();
      closeActionModal();
    } catch (err) {
      console.error("Error cancelling payment:", err);
      alert("Error al cancelar la cuota");
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getMonthName = (month: number) => {
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
    return months[month - 1];
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      "societary-only": "Solo Societaria",
      "principal-sport": "Deporte Principal",
      "secondary-sport": "Deporte Secundario",
    };
    return labels[type] || type;
  };

  const getTypeBadgeClass = (type: string) => {
    const classes: Record<string, string> = {
      "societary-only": "bg-blue-50 text-blue-700 border-blue-300",
      "principal-sport": "bg-green-50 text-green-700 border-green-300",
      "secondary-sport": "bg-orange-50 text-orange-700 border-orange-300",
    };
    return classes[type] || "bg-gray-50 text-gray-700 border-gray-300";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendiente",
      partial: "Parcial",
      paid: "Pagado",
      cancelled: "Cancelado",
    };
    return labels[status] || status;
  };

  const getStatusBadgeClass = (status: string) => {
    const classes: Record<string, string> = {
      pending: "bg-yellow-50 text-yellow-700 border-yellow-300",
      partial: "bg-orange-50 text-orange-700 border-orange-300",
      paid: "bg-green-50 text-green-700 border-green-300",
      cancelled: "bg-red-50 text-red-700 border-red-300",
    };
    return classes[status] || "bg-gray-50 text-gray-700 border-gray-300";
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
              {getMonthName(generationMonth)} {generationYear} • ID:{" "}
              {generationId}
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
                <p className="text-gray-500 font-medium">
                  No hay cuotas en esta generación
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-blue-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700 font-bold uppercase tracking-wide mb-1">
                        Total Cuotas
                      </p>
                      <p className="text-3xl font-black text-blue-900">
                        {payments.length}
                      </p>
                    </div>
                    <div className="bg-blue-200/50 p-3 rounded-lg">
                      <Calendar className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border-2 border-green-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700 font-bold uppercase tracking-wide mb-1">
                        Monto Total
                      </p>
                      <p className="text-3xl font-black text-green-900">
                        {formatCurrency(
                          payments.reduce((sum, p) => sum + p.amount, 0),
                        )}
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
                      <p className="text-sm text-yellow-700 font-bold uppercase tracking-wide mb-1">
                        Monto Pagado
                      </p>
                      <p className="text-3xl font-black text-yellow-900">
                        {formatCurrency(
                          payments.reduce(
                            (sum, p) => sum + (p.paidAmount || 0),
                            0,
                          ),
                        )}
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
                    <svg
                      className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-sm font-semibold text-red-800">
                      {pdfError}
                    </p>
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
                        {(user?.permissions?.can_edit ||
                          user?.permissions?.can_delete) && (
                          <th className="px-4 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                            Acciones
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payments.map((payment) => (
                        <tr
                          key={payment.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm font-bold text-gray-900">
                              #{payment.id}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="bg-gray-100 p-1.5 rounded-lg">
                                <User className="h-4 w-4 text-gray-600" />
                              </div>
                              <div className="text-sm text-gray-900">
                                {(payment.member &&
                                  payment.member.name +
                                    " " +
                                    payment.member.second_name) ||
                                  `Socio #${payment.member.id}`}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold border-2 ${getTypeBadgeClass(payment.type)}`}
                            >
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
                            <span
                              className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold border-2 ${getStatusBadgeClass(payment.status)}`}
                            >
                              {getStatusLabel(payment.status)}
                            </span>
                          </td>
                          {(user?.permissions?.can_edit ||
                            user?.permissions?.can_delete) && (
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {user?.permissions?.can_edit &&
                                  payment.status !== "paid" &&
                                  payment.status !== "cancelled" && (
                                    <button
                                      onClick={() => openPaymentModal(payment)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold border-2 border-green-300 hover:bg-green-100 hover:border-green-400 transition-all"
                                      title="Marcar como pagado"
                                    >
                                      <CheckCircle className="w-3.5 h-3.5" />
                                      Pagar
                                    </button>
                                  )}
                                {user?.permissions?.can_delete &&
                                  payment.status !== "cancelled" && (
                                    <button
                                      onClick={() => openCancelModal(payment)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-bold border-2 border-red-300 hover:bg-red-100 hover:border-red-400 transition-all"
                                      title="Cancelar cuota"
                                    >
                                      <Ban className="w-3.5 h-3.5" />
                                      Cancelar
                                    </button>
                                  )}
                              </div>
                            </td>
                          )}
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
          <div className="flex items-center gap-4">
            <button
              onClick={handleGeneratePdf}
              disabled={isGenerating || loading || payments.length === 0}
              className="inline-flex items-center px-6 py-3 bg-[#FFD700] text-[#1a1a1a] rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
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

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={handleCheckboxChange}
              />
              <span className="text-sm font-medium">
                Incluir cuotas canceladas
              </span>
            </label>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-3 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Action Modal - Pay or Cancel */}
      {actionModal.payment && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-[1100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div
              className={`px-6 py-4 ${actionModal.action === "pay" ? "bg-gradient-to-r from-green-600 to-green-700" : "bg-gradient-to-r from-red-600 to-red-700"}`}
            >
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {actionModal.action === "pay" ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Registrar Pago
                  </>
                ) : (
                  <>
                    <Ban className="w-5 h-5" />
                    Cancelar Cuota
                  </>
                )}
              </h3>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 border-2 border-gray-200">
                <div className="flex justify-between">
                  <span className="text-sm font-semibold text-gray-600">
                    Socio:
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {actionModal.payment.member.name}{" "}
                    {actionModal.payment.member.second_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-semibold text-gray-600">
                    Descripción:
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {actionModal.payment.description}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-semibold text-gray-600">
                    Monto Total:
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatCurrency(actionModal.payment.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-semibold text-gray-600">
                    Pagado:
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatCurrency(actionModal.payment.paidAmount)}
                  </span>
                </div>
                <div className="flex justify-between border-t-2 border-gray-300 pt-2">
                  <span className="text-sm font-bold text-gray-700">
                    Saldo Pendiente:
                  </span>
                  <span className="text-sm font-bold text-green-700">
                    {formatCurrency(
                      actionModal.payment.amount -
                        actionModal.payment.paidAmount,
                    )}
                  </span>
                </div>
              </div>

              {actionModal.action === "pay" ? (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Monto a Pagar
                  </label>
                  <input
                    disabled
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
              ) : (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-red-800">
                    ¿Está seguro que desea cancelar esta cuota? Esta acción no
                    se puede deshacer.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 bg-gray-50 px-6 py-4 border-t-2 border-gray-200">
              <button
                onClick={closeActionModal}
                disabled={actionLoading}
                className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={
                  actionModal.action === "pay"
                    ? handleMarkAsPaid
                    : handleCancelPayment
                }
                disabled={actionLoading}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 ${
                  actionModal.action === "pay"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Procesando...
                  </>
                ) : actionModal.action === "pay" ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Confirmar Pago
                  </>
                ) : (
                  <>
                    <Ban className="w-4 h-4" />
                    Confirmar Cancelación
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
