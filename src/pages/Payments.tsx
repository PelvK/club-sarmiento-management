import React, { useState, /*useMemo*/ } from "react";
import { PlusCircle, History } from "lucide-react";
import { usePayments } from "../hooks/usePayments";
import { useMembers } from "../hooks/useMembers";
import { useSports } from "../hooks/useSports";
import { useMovements } from "../hooks/useMovements";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";
// import { PaymentStatsCard } from "../components/cards/payments/PaymentStatsCard";
// import { PaymentList } from "../components/lists/PaymentList";
// import { MovementList } from "../components/lists/MovementList";
// import type { PaymentFilter, MovementFilter } from "../types";
import { GenerationHistoryList } from "../components/lists/PaymentHIstoryList";
import { PaymentDetailsModal } from "../components/modals/payments/PaymentsDetailModal";
import { PaymentGeneratorModal } from "../components/modals/payments/PaymentsGeneratorModal";
// import { PaymentFilters } from "../components/filters/PaymentsFilters";
// import { MovementFilters } from "../components/filters/MovementsFilters";
import { Payment } from "../lib/types/payment";
import { GenerationConfig } from "../lib/types/quote";

const Payments: React.FC = () => {
  const {
    /*payments,*/
    generations,
    loading: paymentsLoading,
    error: paymentsError,
    // markAsPaid,
    // addPartialPayment,
    generatePayments,
    revertGeneration,
  } = usePayments();

  const {
    /*movements,*/
    loading: movementsLoading,
    error: movementsError,
  } = useMovements();

  const {
    members,
    loading: membersLoading,
    error: membersError,
  } = useMembers();
  const { sports, loading: sportsLoading, error: sportsError } = useSports();

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "payments" | "movements" | "generator" | "history"
  >("generator");

    /*

  const [paymentFilters, setPaymentFilters] = useState<PaymentFilter>({
    memberName: "",
    memberDni: "",
    sport: "",
    status: "",
    dateFrom: "",
    dateTo: "",
    type: "",
  });

  const [movementFilters, setMovementFilters] = useState<MovementFilter>({
    memberName: "",
    memberDni: "",
    sport: "",
    movementType: "",
    dateFrom: "",
    dateTo: "",
    type: "",
  });

  const handlePaymentFilterChange = (
    name: keyof PaymentFilter,
    value: string,
  ) => {
    setPaymentFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleMovementFilterChange = (
    name: keyof MovementFilter,
    value: string,
  ) => {
    setMovementFilters((prev) => ({ ...prev, [name]: value }));
  };

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const memberNameMatch =
        !paymentFilters.memberName ||
        payment.memberName
          ?.toLowerCase()
          .includes(paymentFilters.memberName.toLowerCase());

      const memberDniMatch =
        !paymentFilters.memberDni ||
        members
          .find((m) => m.id === payment.memberId)
          ?.dni.includes(paymentFilters.memberDni);

      const sportMatch =
        !paymentFilters.sport || payment.sportId === paymentFilters.sport;
      const statusMatch =
        !paymentFilters.status || payment.status === paymentFilters.status;
      const typeMatch =
        !paymentFilters.type || payment.type === paymentFilters.type;

      const dateFromMatch =
        !paymentFilters.dateFrom || payment.dueDate >= paymentFilters.dateFrom;
      const dateToMatch =
        !paymentFilters.dateTo || payment.dueDate <= paymentFilters.dateTo;

      return (
        memberNameMatch &&
        memberDniMatch &&
        sportMatch &&
        statusMatch &&
        typeMatch &&
        dateFromMatch &&
        dateToMatch
      );
    });
  }, [payments, paymentFilters, members]);

  const filteredMovements = useMemo(() => {
    return movements.filter((movement) => {
      const memberNameMatch =
        !movementFilters.memberName ||
        movement.memberName
          .toLowerCase()
          .includes(movementFilters.memberName.toLowerCase());

      const memberDniMatch =
        !movementFilters.memberDni ||
        movement.memberDni.includes(movementFilters.memberDni);

      const sportMatch =
        !movementFilters.sport ||
        movement.sportName
          .toLowerCase()
          .includes(movementFilters.sport.toLowerCase());

      const movementTypeMatch =
        !movementFilters.movementType ||
        movement.movementType === movementFilters.movementType;

      const dateFromMatch =
        !movementFilters.dateFrom ||
        movement.timestamp >= movementFilters.dateFrom;

      const dateToMatch =
        !movementFilters.dateTo ||
        movement.timestamp <= movementFilters.dateTo + "T23:59:59";

      // For type filter, we need to infer from sport name or quote name
      const typeMatch =
        !movementFilters.type ||
        (movementFilters.type === "societary" &&
          movement.sportName.toLowerCase().includes("societaria")) ||
        (movementFilters.type === "sport" &&
          !movement.sportName.toLowerCase().includes("societaria"));

      return (
        memberNameMatch &&
        memberDniMatch &&
        sportMatch &&
        movementTypeMatch &&
        dateFromMatch &&
        dateToMatch &&
        typeMatch
      );
    });
  }, [movements, movementFilters]);

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  }; */

/*   const handleEditPayment = (payment: Payment) => {
    // For now, just show details. In the future, this could open an edit modal
    handleViewDetails(payment);
  };
 */
  const handleCloseDetailsModal = () => {
    setSelectedPayment(null);
    setShowDetailsModal(false);
  };

  const handleGeneratePayments = async (config: GenerationConfig) => {
    try {
      console.log("Generating payments with config:", config);
      // await generatePayments(config);
      setShowGeneratorModal(false);
    } catch (error) {
      console.error("Error generating payments:", error);
    }
  };

  const loading =
    paymentsLoading || membersLoading || sportsLoading || movementsLoading;
  const error = paymentsError || membersError || sportsError || movementsError;

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
          {/*
          <button
            onClick={() => setActiveTab("payments")}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              activeTab === "payments"
                ? "bg-[#FFD700] text-black"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Cuotas
          </button>

          <button
            onClick={() => setActiveTab("movements")}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              activeTab === "movements"
                ? "bg-[#FFD700] text-black"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Activity className="w-5 h-5 mr-2" />
            Movimientos
          </button> */}

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
      {/* 
      {activeTab === "payments" && (
        <>
          <PaymentFilters
            filters={paymentFilters}
            onFilterChange={handlePaymentFilterChange}
            sports={sports}
          />
          
          <PaymentStatsCard payments={filteredPayments} />

          <PaymentList
            payments={filteredPayments}
            onMarkAsPaid={markAsPaid}
            onAddPartialPayment={addPartialPayment}
            onViewDetails={handleViewDetails}
            onEdit={handleEditPayment}
          />
        </>
      )} 

      {activeTab === "movements" && (
        <>
          <MovementFilters
            filters={movementFilters}
            onFilterChange={handleMovementFilterChange}
            sports={sports}
          />

          <MovementList movements={filteredMovements} />
        </>
      )}
            */}

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
