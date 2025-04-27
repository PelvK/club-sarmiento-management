import React, { useState } from 'react';
import { ArrowLeft, Users, CreditCard, Trophy, Home } from 'lucide-react';
import type { Member, Payment } from '../types';

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
}

interface MemberDetailsModalProps {
  member: Member;
  onClose: () => void;
  payments: Payment[];
  familyMembers: FamilyMember[];
}

export const MemberDetailsModal: React.FC<MemberDetailsModalProps> = ({
  member,
  onClose,
  payments,
  familyMembers
}) => {
  const [selectedSport, setSelectedSport] = useState<string>('all');

  // Get unique sports from payments
  const sports = Array.from(new Set(payments.map(payment => payment.sportId)));

  // Filter payments by selected sport
  const filteredPayments = selectedSport === 'all' 
    ? payments 
    : payments.filter(payment => payment.sportId === selectedSport);

  return (
    <div className="fixed inset-0 bg-gray-100 overflow-y-auto">
      {/* Header */}
      <div className="bg-[#1a1a1a] p-4 sticky top-0 z-10">
        <div className="flex items-center">
          <button
            onClick={onClose}
            className="text-[#FFD700] hover:text-[#FFC000] mr-4"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-[#FFD700]">Detalles del Socio</h1>
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
                <label className="text-sm text-gray-500">DNI</label>
                <p className="font-medium">{member.dni}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="font-medium">{member.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Teléfono</label>
                <p className="font-medium">{member.phone}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Fecha de Ingreso</label>
                <p className="font-medium">{new Date(member.joinDate).toLocaleDateString()}</p>
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
              <div>
                <label className="text-sm text-gray-500">Deporte</label>
                <p className="font-medium">{member.sport}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">ID de Cuota</label>
                <p className="font-medium">{member.quoteId}</p>
              </div>
            </div>
          </div>

          {/* Family Group Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Home className="h-6 w-6 text-[#FFD700] mr-2" />
              <h2 className="text-xl font-semibold">Grupo Familiar</h2>
            </div>
            {familyMembers.length > 0 ? (
              <div className="space-y-4">
                {familyMembers.map((familyMember) => (
                  <div
                    key={familyMember.id}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div>
                      <p className="font-medium">{familyMember.name}</p>
                      <p className="text-sm text-gray-500">{familyMember.relationship}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No pertenece a ningún grupo familiar</p>
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
                <label htmlFor="sportFilter" className="text-sm font-medium text-gray-700">
                  Filtrar por disciplina:
                </label>
                <select
                  id="sportFilter"
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
                >
                  <option value="all">Todas las disciplinas</option>
                  {sports.map((sport) => (
                    <option key={sport} value={sport}>
                      Disciplina {sport}
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
                        Disciplina {payment.sportId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${payment.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            payment.status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : payment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {payment.status === 'paid' ? 'Pagado' : payment.status === 'pending' ? 'Pendiente' : 'Vencido'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.paidDate ? new Date(payment.paidDate).toLocaleDateString() : '-'}
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