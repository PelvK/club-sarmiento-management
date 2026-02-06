import React, { useState } from "react";
import { ArrowLeft, Users, CreditCard, Trophy, Home } from "lucide-react";
import { Member } from "../../../lib/types/member";
import { Payment } from "../../../lib/types/payment";
import { FAMILY_STATUS } from "../../../lib/enums/SportSelection";

interface MemberDetailsModalProps {
  member: Member;
  onClose: () => void;
  payments: Payment[];
  familyMembers: Member[];
  familyHead: Member | null;
}

export const MemberDetailsModal: React.FC<MemberDetailsModalProps> = ({
  member,
  onClose,
  payments,
  familyMembers,
  familyHead,
}) => {
  const [selectedSport, setSelectedSport] = useState<number | undefined>();

  const filteredPayments =
    selectedSport === undefined
      ? payments
      : payments.filter((payment) => payment.sport.id === selectedSport);

  return (
    <div className="fixed inset-0 bg-gray-100 overflow-y-auto z-50">
      {/* Header */}
      <div className="bg-[#1a1a1a] p-4 sticky top-0 z-10">
        <div className="flex items-center">
          <button
            onClick={onClose}
            className="text-[#FFD700] hover:text-[#FFC000] mr-4"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-[#FFD700]">
            Detalles del Socio
          </h1>
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Personal Information Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Users className="h-6 w-6 text-[#FFD700] mr-2" />
              <h2 className="text-xl font-semibold">Información Personal</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Nombre</label>
                <p className="font-medium">{member.name}</p>
              </div>

              <div>
                <label className="text-sm text-gray-500">Apellido</label>
                <p className="font-medium">{member.second_name}</p>
              </div>

              <div>
                <label className="text-sm text-gray-500">DNI</label>
                <p className="font-medium">{member.dni}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">
                  Fecha de Nacimiento
                </label>
                <p className="font-medium">
                  {new Date(member.birthdate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Teléfono</label>
                <p className="font-medium">{member.phone_number}</p>
              </div>

              <div>
                <label className="text-sm text-gray-500">
                  Correo electrónico
                </label>
                <p className="font-medium">{member.email}</p>
              </div>
            </div>
          </div>

          {/* Sport Information Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Trophy className="h-6 w-6 text-[#FFD700] mr-2" />
              <h2 className="text-xl font-semibold">Información Deportiva</h2>
            </div>
            <div className="space-y-3">
              <div className="space-y-4">
                <p className="text-sm text-gray-500 mb-2">Cuota societaria:</p>
                <div
                  key={member.societary_cuote?.id}
                  className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow flex w-full"
                >
                  <div className="flex w-full justify-between items-startmb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {member.societary_cuote?.name}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {member.societary_cuote?.description}
                      </p>
                    </div>
                    <div className="text-right ml-3 flex-shrink-0">
                      <p className="text-lg font-bold text-[#FFD700]">
                        ${member.societary_cuote?.price || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 border-t pt-4 mb-2">Cuotas deportivas:</p>
                {member.sports?.map((sport) => (
                  <div
                    key={sport.id}
                    className="flex items-center justify-between pb-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">
                        {member.sports && member.sports?.length > 0
                          ? sport.name
                          : ""}
                        <div
                          key={sport.quotes![0].id}
                          className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow flex w-full"
                        >
                          <div className="flex w-full justify-between items-start mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 text-sm truncate">
                                {sport.quotes![0].name}
                              </h3>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {sport.quotes![0].description}
                              </p>
                            </div>
                            <div className="text-right ml-3 flex-shrink-0">
                              <p className="text-lg font-bold text-[#FFD700]">
                                ${sport.quotes![0].price || "N/A"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                            {/*<Calendar className="h-3 w-3 mr-1" />
                                <span>
                                {quote.duration}{" "}
                                {quote.duration === 1 ? "mes" : "meses"}
                              </span>
                              </div>
                            */}
                          </div>
                        </div>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Family Group Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Home className="h-6 w-6 text-[#FFD700] mr-2" />
              <h2 className="text-xl font-semibold">Grupo Familiar</h2>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500">Jefe de Familia:</p>
              {familyHead ? (
                <p className="font-medium">
                  {familyHead.name} {familyHead.second_name}
                </p>
              ) : member.familyGroupStatus === FAMILY_STATUS.HEAD ? (
                <p className="font-medium">El es jefe de familia</p>
              ) : (
                <p className="text-gray-500">No asignado</p>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-2">
              Miembros del Grupo Familiar:
            </p>
            {/* List of family members */}
            {familyMembers.length > 0 ? (
              <div className="space-y-4">
                {familyMembers.map((familyMember) => (
                  <div
                    key={familyMember.id}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div>
                      <p className="font-medium">
                        {familyMember.name} {familyMember.second_name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">
                No hay miembros familiares registrados.
              </p>
            )}
          </div>

          {/* Payment History Card - Spans full width */}
          <div className="bg-white rounded-lg shadow-md p-6 md:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <CreditCard className="h-6 w-6 text-[#FFD700] mr-2" />
                <h2 className="text-xl font-semibold">Historial de Pagos</h2>
              </div>
              <div className="flex items-center space-x-2">
                <label
                  htmlFor="sportFilter"
                  className="text-sm font-medium text-gray-700"
                >
                  Filtrar por disciplina:
                </label>
                <select
                  id="sportFilter"
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(Number(e.target.value))}
                  className="rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
                >
                  <option value="all">Todas las disciplinas</option>
                  {member.sports?.map((sport) => (
                    <option key={sport.id} value={sport.id}>
                      {sport.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha de Vencimiento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Disciplina
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha de Pago
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Disciplina {payment.sport.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${payment.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            payment.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : payment.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {payment.status === "paid"
                            ? "Pagado"
                            : payment.status === "pending"
                            ? "Pendiente"
                            : "Vencido"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.paidDate
                          ? new Date(payment.paidDate).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
