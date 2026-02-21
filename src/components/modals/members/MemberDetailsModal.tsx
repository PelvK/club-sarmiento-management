import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Users,
  CreditCard,
  Trophy,
  Home,
  Tag,
  CheckCircle,
  Ban,
  Loader2,
  Phone,
  Mail,
  Calendar,
  Hash,
  User,
  RefreshCw,
  MapPin,
} from "lucide-react";
import { Member } from "../../../lib/types/member";
import { Payment } from "../../../lib/types/payment";
import { FAMILY_STATUS } from "../../../lib/enums/SportSelection";
import { useAuth } from "../../../hooks/useAuth";
import { paymentsApi } from "../../../lib/api/payments";

interface PaymentActionModal {
  payment: Payment | null;
  action: "pay" | "cancel" | null;
}

interface MemberDetailsModalProps {
  member: Member;
  onClose: () => void;
  familyMembers: Member[];
  familyHead: Member | null;
  onMarkAsPaid?: (id: number, amount: number) => Promise<void>;
  onCancelPayment?: (id: number) => Promise<void>;
}

export const MemberDetailsModal: React.FC<MemberDetailsModalProps> = ({
  member,
  onClose,
  familyMembers,
  familyHead,
  onMarkAsPaid,
  onCancelPayment,
}) => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [actionModal, setActionModal] = useState<PaymentActionModal>({
    payment: null,
    action: null,
  });
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchMemberPayments = useCallback(async () => {
    setPaymentsLoading(true);
    try {
      const data = await paymentsApi.getByMember(member.id);
      setPayments(data);
    } catch (err) {
      console.error("Failed to fetch member payments", err);
    } finally {
      setPaymentsLoading(false);
    }
  }, [member.id]);

  useEffect(() => {
    fetchMemberPayments();
  }, [fetchMemberPayments]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(amount);

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
    if (!actionModal.payment || !onMarkAsPaid) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;

    const remainingAmount =
      actionModal.payment.amount - actionModal.payment.paidAmount;
    if (amount > remainingAmount) return;

    setActionLoading(true);
    try {
      await onMarkAsPaid(actionModal.payment.id, amount);
      closeActionModal();
      await fetchMemberPayments();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelPayment = async () => {
    if (!actionModal.payment || !onCancelPayment) return;

    setActionLoading(true);
    try {
      await onCancelPayment(actionModal.payment.id);
      closeActionModal();
      await fetchMemberPayments();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const paidAmount = payments.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
  const pendingCount = payments.filter(
    (p) => p.status === "pending" || p.status === "partial",
  ).length;

  return (
    <div className="fixed inset-0 bg-gray-100 overflow-y-auto z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1a1a] to-black px-6 py-5 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 text-[#d4d4d4] hover:bg-[#FFD700]/20 hover:text-[#FFD700] hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#d4d4d4] tracking-wide flex items-center gap-2">
                <User className="w-5 h-5 text-[#FFD700]" />
                Detalle del Socio
              </h1>
              <p className="text-sm text-[#a3a3a3] mt-0.5">
                {member.name} {member.second_name} • DNI {member.dni}
              </p>
            </div>
          </div>
          {member.active !== undefined && (
            <span
              className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold border-2 ${
                member.active
                  ? "bg-green-50 text-green-700 border-green-300"
                  : "bg-red-50 text-red-700 border-red-300"
              }`}
            >
              {member.active ? "Activo" : "Inactivo"}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Top cards row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Personal Information Card */}
          <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-5 py-4 border-b-2 border-gray-200">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#FFD700]" />
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                  Información Personal
                </h2>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <InfoRow
                icon={<User className="h-4 w-4 text-gray-400" />}
                label="Nombre"
                value={`${member.name} ${member.second_name}`}
              />
              <InfoRow
                icon={<Hash className="h-4 w-4 text-gray-400" />}
                label="DNI"
                value={member.dni}
              />
              <InfoRow
                icon={<Calendar className="h-4 w-4 text-gray-400" />}
                label="Fecha de Nacimiento"
                value={new Date(member.birthdate).toLocaleDateString("es-AR")}
              />
              {member.phone_number && (
                <InfoRow
                  icon={<Phone className="h-4 w-4 text-gray-400" />}
                  label="Teléfono"
                  value={member.phone_number}
                />
              )}
              {member.address && (
                <InfoRow
                  icon={<MapPin className="h-4 w-4 text-gray-400" />}
                  label="Dirección"
                  value={member.address}
                />
              )}
              {member.email && (
                <InfoRow
                  icon={<Mail className="h-4 w-4 text-gray-400" />}
                  label="Email"
                  value={member.email}
                />
              )}
            </div>
          </div>

          {/* Sport Information Card */}
          <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-5 py-4 border-b-2 border-gray-200">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-[#FFD700]" />
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                  Información Deportiva
                </h2>
              </div>
            </div>
            <div className="p-5 space-y-4">
              {member.societary_cuote && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    Cuota Societaria
                  </p>
                  <div className="border-2 border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {member.societary_cuote.name}
                        </p>
                        {member.societary_cuote.description && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                            {member.societary_cuote.description}
                          </p>
                        )}
                      </div>
                      <span className="text-base font-bold text-[#313131] ml-3 flex-shrink-0">
                        {formatCurrency(member.societary_cuote.price || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {member.sports && member.sports.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    Cuotas Deportivas
                  </p>
                  <div className="space-y-2">
                    {member.sports.map((sport) => (
                      <div
                        key={sport.id}
                        className="border-2 border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900 text-sm truncate">
                                {sport.name}
                              </p>
                              {sport.isPrincipal && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                                  Principal
                                </span>
                              )}
                            </div>
                            {sport.quotes && sport.quotes[0] && (
                              <p className="text-xs text-gray-500 mt-0.5 truncate">
                                {sport.quotes[0].name}
                              </p>
                            )}
                          </div>
                          {sport.quotes && sport.quotes[0] && (
                            <span className="text-base font-bold text-[#313131] ml-3 flex-shrink-0">
                              {formatCurrency(sport.quotes[0].price || 0)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Family Group Card */}
          <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-5 py-4 border-b-2 border-gray-200">
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-[#FFD700]" />
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                  Grupo Familiar
                </h2>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Jefe de Familia
                </p>
                {familyHead ? (
                  <div className="border-2 border-gray-200 rounded-lg p-3">
                    <p className="font-semibold text-gray-900 text-sm">
                      {familyHead.name} {familyHead.second_name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      DNI: {familyHead.dni}
                    </p>
                  </div>
                ) : member.familyGroupStatus === FAMILY_STATUS.HEAD ? (
                  <div className="border-2 border-green-200 bg-green-50 rounded-lg p-3">
                    <p className="font-semibold text-green-800 text-sm">
                      Es jefe de familia
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No asignado</p>
                )}
              </div>

              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Miembros del Grupo ({familyMembers.length})
                </p>
                {familyMembers.length > 0 ? (
                  <div className="space-y-2">
                    {familyMembers.map((fm) => (
                      <div
                        key={fm.id}
                        className="border-2 border-gray-200 rounded-lg p-3"
                      >
                        <p className="font-semibold text-gray-900 text-sm">
                          {fm.name} {fm.second_name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          DNI: {fm.dni}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    Sin miembros registrados
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Payment History - Full width */}
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-5 py-4 border-b-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[#FFD700]" />
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                  Historial de Cuotas
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span className="font-semibold">
                    Total:{" "}
                    <span className="text-gray-900 font-bold">
                      {formatCurrency(totalAmount)}
                    </span>
                  </span>
                  <span className="font-semibold">
                    Pagado:{" "}
                    <span className="text-green-700 font-bold">
                      {formatCurrency(paidAmount)}
                    </span>
                  </span>
                  {pendingCount > 0 && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border-2 bg-yellow-50 text-yellow-700 border-yellow-300">
                      {pendingCount} pendiente{pendingCount !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <button
                  onClick={fetchMemberPayments}
                  disabled={paymentsLoading}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border-2 border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-all disabled:opacity-50"
                  title="Actualizar cuotas"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${paymentsLoading ? "animate-spin" : ""}`}
                  />
                </button>
              </div>
            </div>
          </div>

          {paymentsLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <Loader2 className="h-8 w-8 animate-spin mr-3" />
              <p className="font-medium">Cargando cuotas...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <CreditCard className="h-12 w-12 mb-3 opacity-30" />
              <p className="font-medium">
                No hay cuotas registradas para este socio
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y-2 divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Período
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
                      user?.permissions?.can_delete) &&
                      (onMarkAsPaid || onCancelPayment) && (
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
                        <span className="text-sm text-gray-700 font-medium">
                          {getMonthName(payment.month)} {payment.year}
                        </span>
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
                        user?.permissions?.can_delete) &&
                        (onMarkAsPaid || onCancelPayment) && (
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {user?.permissions?.can_edit &&
                                onMarkAsPaid &&
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
                                onCancelPayment &&
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
          )}
        </div>
      </div>

      {/* Action Modal - Pay or Cancel */}
      {actionModal.payment && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-[1100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div
              className={`px-6 py-4 ${
                actionModal.action === "pay"
                  ? "bg-gradient-to-r from-green-600 to-green-700"
                  : "bg-gradient-to-r from-red-600 to-red-700"
              }`}
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

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 border-2 border-gray-200">
                <div className="flex justify-between">
                  <span className="text-sm font-semibold text-gray-600">
                    Socio:
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {member.name} {member.second_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-semibold text-gray-600">
                    Período:
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {getMonthName(actionModal.payment.month)}{" "}
                    {actionModal.payment.year}
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

const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 flex-shrink-0">{icon}</div>
    <div className="min-w-0">
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-sm font-semibold text-gray-900 truncate">{value}</p>
    </div>
  </div>
);
