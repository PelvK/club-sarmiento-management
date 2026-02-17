import React, { useState } from "react";
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  DollarSign,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
  Receipt,
} from "lucide-react";
import { Payment } from "../../lib/types/payment";

interface PaymentListProps {
  payments: Payment[];
  onMarkAsPaid: (id: string) => void;
  onAddPartialPayment: (id: string, amount: number, notes?: string) => void;
  onViewDetails: (payment: Payment) => void;
  onEdit: (payment: Payment) => void;
}

export const PaymentList: React.FC<PaymentListProps> = ({
  payments,
  onMarkAsPaid,
  onAddPartialPayment,
  onViewDetails,
  onEdit,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showPartialModal, setShowPartialModal] = useState<string | null>(null);
  const [partialAmount, setPartialAmount] = useState("");
  const [partialNotes, setPartialNotes] = useState("");

  const paymentsPerPage = 15;
  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = payments.slice(
    indexOfFirstPayment,
    indexOfLastPayment,
  );
  const totalPages = Math.ceil(payments.length / paymentsPerPage);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "overdue":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "partial":
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case "cancelled":
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Pagado";
      case "pending":
        return "Pendiente";
      case "overdue":
        return "Vencido";
      case "partial":
        return "Parcial";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "partial":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-AR");
  };

  const handlePartialPayment = (paymentId: string) => {
    const amount = parseFloat(partialAmount);
    if (amount > 0) {
      onAddPartialPayment(paymentId, amount, partialNotes);
      setShowPartialModal(null);
      setPartialAmount("");
      setPartialNotes("");
    }
  };

  const getPaidAmount = (payment: Payment) => {
    if (payment.status === "paid") return payment.amount;
    if (payment.status === "partial") {
      return (
        payment.partialPayments?.reduce((sum, pp) => sum + pp.amount, 0) || 0
      );
    }
    return 0;
  };

  const getRemainingAmount = (payment: Payment) => {
    return payment.amount - getPaidAmount(payment);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#1a1a1a]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#FFD700] uppercase tracking-wider">
                  Socio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#FFD700] uppercase tracking-wider">
                  Disciplina
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#FFD700] uppercase tracking-wider">
                  Cuota
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#FFD700] uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#FFD700] uppercase tracking-wider">
                  Vencimiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#FFD700] uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#FFD700] uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentPayments.length > 0 ? (
                currentPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.memberName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {payment.sportName}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {payment.type}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.quoteName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount)}
                      </div>
                      {payment.status === "partial" && (
                        <div className="text-xs text-gray-500">
                          Pagado: {formatCurrency(getPaidAmount(payment))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(payment.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(payment.status)}
                        <span
                          className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(payment.status)}`}
                        >
                          {getStatusText(payment.status)}
                        </span>
                      </div>
                      {payment.tags && payment.tags.length > 0 && (
                        <div className="mt-1">
                          {payment.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onViewDetails(payment)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(payment)}
                          className="text-gray-600 hover:text-gray-800 transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-800 transition-colors"
                          title="Generar comprobante"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>
                        {payment.status === "pending" && (
                          <button
                            onClick={() => onMarkAsPaid(payment.id)}
                            className="text-green-600 hover:text-green-800 transition-colors"
                            title="Marcar como pagado"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {(payment.status === "pending" ||
                          payment.status === "partial") && (
                          <button
                            onClick={() => setShowPartialModal(payment.id)}
                            className="text-orange-600 hover:text-orange-800 transition-colors"
                            title="Pago parcial"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No hay cuotas para mostrar
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {payments.length > 0 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 mt-4 shadow-md rounded-lg">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Anterior
            </button>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`relative ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando{" "}
                <span className="font-medium">{indexOfFirstPayment + 1}</span> a{" "}
                <span className="font-medium">
                  {Math.min(indexOfLastPayment, payments.length)}
                </span>{" "}
                de <span className="font-medium">{payments.length}</span> cuotas
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="bg-[#1a1a1a] text-[#FFD700] relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium">
                  {currentPage} / {totalPages}
                </div>
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Partial Payment Modal */}
      {showPartialModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Registrar Pago Parcial
            </h3>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="partialAmount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Monto
                </label>
                <input
                  type="number"
                  id="partialAmount"
                  value={partialAmount}
                  onChange={(e) => setPartialAmount(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label
                  htmlFor="partialNotes"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Notas (opcional)
                </label>
                <textarea
                  id="partialNotes"
                  value={partialNotes}
                  onChange={(e) => setPartialNotes(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
                  rows={3}
                  placeholder="Notas adicionales..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowPartialModal(null);
                  setPartialAmount("");
                  setPartialNotes("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handlePartialPayment(showPartialModal)}
                className="px-4 py-2 bg-[#FFD700] text-black rounded-md hover:bg-[#FFC000]"
              >
                Registrar Pago
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
