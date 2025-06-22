import React from 'react';
import { Calendar, RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import type { PaymentGeneration } from '../../types';

interface GenerationHistoryListProps {
  generations: PaymentGeneration[];
  onRevert: (generationId: string) => void;
}

export const GenerationHistoryList: React.FC<GenerationHistoryListProps> = ({
  generations,
  onRevert
}) => {
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

  const getMonthName = (month: number) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1];
  };

  const getStatusIcon = (status: string) => {
    return status === 'active' 
      ? <CheckCircle className="h-5 w-5 text-green-500" />
      : <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getStatusText = (status: string) => {
    return status === 'active' ? 'Activa' : 'Revertida';
  };

  const getStatusBadgeClass = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Historial de Generaciones</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Período
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha de Generación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cuotas Generadas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {generations.length > 0 ? (
              generations.map((generation) => (
                <tr key={generation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-[#FFD700] mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {getMonthName(generation.month)} {generation.year}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {generation.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(generation.generatedDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {generation.totalPayments} cuotas
                    </div>
                    <div className="text-xs text-gray-500">
                      {generation.breakdown.sportPayments} deportivas, {generation.breakdown.societaryPayments} societarias
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(generation.totalAmount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Deportivas: {formatCurrency(generation.breakdown.totalSportAmount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Societarias: {formatCurrency(generation.breakdown.totalSocietaryAmount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(generation.status)}
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(generation.status)}`}>
                        {getStatusText(generation.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {generation.status === 'active' && (
                      <button
                        onClick={() => {
                          if (window.confirm('¿Está seguro de que desea revertir esta generación? Esta acción eliminará todas las cuotas generadas.')) {
                            onRevert(generation.id);
                          }
                        }}
                        className="flex items-center text-red-600 hover:text-red-800 transition-colors"
                        title="Revertir generación"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Revertir
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No hay generaciones registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};