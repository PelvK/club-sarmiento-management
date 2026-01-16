import React, { useState } from "react";
import {
  Activity,
  CheckCircle,
  Edit,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Plus,
  Minus,
  RotateCcw,
} from "lucide-react";
import type { PaymentMovement, MOVEMENT_TYPE } from "../../types";

interface MovementListProps {
  movements: PaymentMovement[];
}

export const MovementList: React.FC<MovementListProps> = ({ movements }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const movementsPerPage = 15;

  const indexOfLastMovement = currentPage * movementsPerPage;
  const indexOfFirstMovement = indexOfLastMovement - movementsPerPage;
  const currentMovements = movements.slice(
    indexOfFirstMovement,
    indexOfLastMovement
  );
  const totalPages = Math.ceil(movements.length / movementsPerPage);

  const getMovementIcon = (type: MOVEMENT_TYPE) => {
    switch (type) {
      case "created":
        return <Plus className="w-5 h-5 text-blue-500" />;
      case "partial_payment":
        return <Minus className="w-5 h-5 text-orange-500" />;
      case "full_payment":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "status_change":
        return <ArrowUpDown className="w-5 h-5 text-purple-500" />;
      case "amount_modified":
        return <Edit className="w-5 h-5 text-yellow-500" />;
      case "reverted":
        return <RotateCcw className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getMovementText = (type: MOVEMENT_TYPE) => {
    switch (type) {
      case "created":
        return "Cuota Creada";
      case "partial_payment":
        return "Pago Parcial";
      case "full_payment":
        return "Pago Completo";
      case "status_change":
        return "Cambio de Estado";
      case "amount_modified":
        return "Monto Modificado";
      case "reverted":
        return "Revertido";
      default:
        return type;
    }
  };

  const getMovementBadgeClass = (type: MOVEMENT_TYPE) => {
    switch (type) {
      case "created":
        return "bg-blue-100 text-blue-800";
      case "partial_payment":
        return "bg-orange-100 text-orange-800";
      case "full_payment":
        return "bg-green-100 text-green-800";
      case "status_change":
        return "bg-purple-100 text-purple-800";
      case "amount_modified":
        return "bg-yellow-100 text-yellow-800";
      case "reverted":
        return "bg-red-100 text-red-800";
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-AR");
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
      default:
        return status;
    }
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
                  Fecha/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#FFD700] uppercase tracking-wider">
                  Socio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#FFD700] uppercase tracking-wider">
                  Disciplina/Cuota
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#FFD700] uppercase tracking-wider">
                  Movimiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#FFD700] uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#FFD700] uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#FFD700] uppercase tracking-wider">
                  Usuario
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentMovements.length > 0 ? (
                currentMovements.map((movement) => (
                  <tr
                    key={movement.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateTime(movement.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {movement.memberName}
                      </div>
                      <div className="text-xs text-gray-500">
                        DNI: {movement.memberDni}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {movement.sportName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {movement.quoteName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getMovementIcon(movement.movementType)}
                        <span
                          className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getMovementBadgeClass(
                            movement.movementType
                          )}`}
                        >
                          {getMovementText(movement.movementType)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {movement.previousStatus && (
                        <div className="text-xs text-gray-500">
                          {getStatusText(movement.previousStatus)} →
                        </div>
                      )}
                      <div className="text-sm font-medium text-gray-900">
                        {getStatusText(movement.newStatus)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(movement.amount)}
                      </div>
                      {movement.partialAmount && (
                        <div className="text-xs text-green-600">
                          Pago: {formatCurrency(movement.partialAmount)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {movement.userName || "Sistema"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No hay movimientos para mostrar
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {movements.length > 0 && (
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
                <span className="font-medium">{indexOfFirstMovement + 1}</span>{" "}
                a{" "}
                <span className="font-medium">
                  {Math.min(indexOfLastMovement, movements.length)}
                </span>{" "}
                de <span className="font-medium">{movements.length}</span>{" "}
                movimientos
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
    </div>
  );
};
