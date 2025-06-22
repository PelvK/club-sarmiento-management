import React, { useState, useMemo } from "react";
import { PlusCircle, BarChart3, History } from "lucide-react";
import { usePayments } from "../hooks/usePayments";
import { useMembers } from "../hooks/useMembers";
import { useSports } from "../hooks/useSports";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";
import { PaymentStatsCard } from "../components/cards/payments/PaymentStatsCard";
import { PaymentList } from "../components/lists/PaymentList";
import type { Payment, PaymentFilter } from "../types";
import { GenerationHistoryList } from "../components/lists/PaymentHIstoryList";
import { PaymentDetailsModal } from "../components/modals/payments/PaymentsDetailModal";
import { PaymentGeneratorModal } from "../components/modals/payments/PaymentsGeneratorModal";
import { PaymentFilters } from "../components/filters/PaymentsFilters";

const Payments: React.FC = () => {
  const {
    payments,
    generations,
    loading: paymentsLoading,
    error: paymentsError,
    markAsPaid,
    addPartialPayment,
    generatePayments,
    revertGeneration,
    updatePayment,
  } = usePayments();

  const {
    members,
    loading: membersLoading,
    error: membersError,
  } = useMembers();
  const { sports, loading: sportsLoading, error: sportsError } = useSports();

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "payments" | "generator" | "history"
  >("payments");

  const [filters, setFilters] = useState<PaymentFilter>({
    member: "",
    sport: "",
    status: "",
    dateFrom: "",
    dateTo: "",
    type: "",
  });

  const handleFilterChange = (name: keyof PaymentFilter, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const memberMatch =
        !filters.member || payment.memberId === filters.member;
      const sportMatch = !filters.sport || payment.sportId === filters.sport;
      const statusMatch = !filters.status || payment.status === filters.status;
      const typeMatch = !filters.type || payment.type === filters.type;

      const dateFromMatch =
        !filters.dateFrom || payment.dueDate >= filters.dateFrom;
      const dateToMatch = !filters.dateTo || payment.dueDate <= filters.dateTo;

      return (
        memberMatch &&
        sportMatch &&
        statusMatch &&
        typeMatch &&
        dateFromMatch &&
        dateToMatch
      );
    });
  }, [payments, filters]);

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const handleEditPayment = (payment: Payment) => {
    // For now, just show details. In the future, this could open an edit modal
    handleViewDetails(payment);
  };

  const handleCloseDetailsModal = () => {
    setSelectedPayment(null);
    setShowDetailsModal(false);
  };

  const handleGeneratePayments = async (config: any) => {
    try {
      await generatePayments(config);
      setShowGeneratorModal(false);
    } catch (error) {
      console.error("Error generating payments:", error);
    }
  };

  const loading = paymentsLoading || membersLoading || sportsLoading;
  const error = paymentsError || membersError || sportsError;

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          Gestión de Cuotas
        </h1>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("payments")}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              activeTab === "payments"
                ? "bg-[#FFD700] text-black"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            Cuotas
          </button>

          <button
            onClick={() => setActiveTab("generator")}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              activeTab === "generator"
                ? "bg-[#FFD700] text-black"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Generar Cuotas
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              activeTab === "history"
                ? "bg-[#FFD700] text-black"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <History className="w-5 h-5 mr-2" />
            Historial
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === "payments" && (
        <>
          {/* Filters */}
          <PaymentFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            sports={sports}
            members={members}
          />
          {/* Stats Cards */}
          <PaymentStatsCard payments={filteredPayments} />

          {/* Payments List */}
          <PaymentList
            payments={filteredPayments}
            onMarkAsPaid={markAsPaid}
            onAddPartialPayment={addPartialPayment}
            onViewDetails={handleViewDetails}
            onEdit={handleEditPayment}
          />
        </>
      )}

      {activeTab === "generator" && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Generador de Cuotas
            </h2>
            <p className="text-gray-600 mb-6">
              Genere cuotas masivamente para un período específico
            </p>
            <button
              onClick={() => setShowGeneratorModal(true)}
              className="flex items-center mx-auto px-6 py-3 bg-[#FFD700] text-black rounded-md hover:bg-[#FFC000] transition-colors"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Abrir Generador
            </button>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <GenerationHistoryList
          generations={generations}
          onRevert={revertGeneration}
        />
      )}

      {/* Modals */}
      <PaymentDetailsModal
        payment={selectedPayment}
        isOpen={showDetailsModal}
        onClose={handleCloseDetailsModal}
      />

      <PaymentGeneratorModal
        isOpen={showGeneratorModal}
        onClose={() => setShowGeneratorModal(false)}
        onGenerate={handleGeneratePayments}
        members={members}
        sports={sports}
      />
    </div>
  );
};

export default Payments;
