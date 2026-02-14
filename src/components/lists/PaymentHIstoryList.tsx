import React, { useState, useMemo } from 'react';
import { Calendar, RotateCcw, CheckCircle, XCircle, Eye, ChevronLeft, ChevronRight, History } from 'lucide-react';
import { PaymentGeneration, Payment } from '../../lib/types/payment';
import { GenerationDetailsModal } from '../modals/payments/GenerationDetailsModal';
import './paymentHistory/styles.css'

interface GenerationHistoryListProps {
  generations: PaymentGeneration[];
  payments?: Payment[];
  onRevert: (generationId: string) => void;
}

export const GenerationHistoryList: React.FC<GenerationHistoryListProps> = ({
  generations,
  payments = [],
  onRevert
}) => {
  const [selectedGeneration, setSelectedGeneration] = useState<PaymentGeneration | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentGenerations = generations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(generations.length / itemsPerPage);

  // Pagination functions
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

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);

  const getGenerationProgress = useMemo(() => {
    return (generationId: string) => {
      const generationPayments = payments.filter(p => p.generationId === generationId);
      const total = generationPayments.length;
      const paid = generationPayments.filter(p => p.status === 'paid').length;
      const percentage = total > 0 ? (paid / total) * 100 : 0;

      return { total, paid, percentage };
    };
  }, [payments]);

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
      ? 'bg-green-50 text-green-700 border-2 border-green-300'
      : 'bg-red-50 text-red-700 border-2 border-red-300';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getProgressTextColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-700';
    if (percentage >= 50) return 'text-yellow-700';
    if (percentage >= 20) return 'text-orange-700';
    return 'text-red-700';
  };

  const handleRowClick = (generation: PaymentGeneration) => {
    setSelectedGeneration(generation);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGeneration(null);
  };

  return (
    <>
      <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-md">
        <div className="user-generation-history-header">
          <h3 className="text-lg font-bold text-gray-200 flex items-center gap-2">
            <History className="w-5 h-5 text-gray-200" />
            Historial de Generaciones
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)' }}>
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#d4d4d4' }}>
                  Período
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#d4d4d4' }}>
                  Fecha de Generación
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#d4d4d4' }}>
                  Cuotas Generadas
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#d4d4d4' }}>
                  Monto Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#d4d4d4' }}>
                  Progreso de Pagos
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#d4d4d4' }}>
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#d4d4d4' }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentGenerations.length > 0 ? (
                currentGenerations.map((generation) => {
                  const progress = getGenerationProgress(generation.id);
                  return (
                    <tr
                      key={generation.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleRowClick(generation)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="bg-[#FFD700]/20 p-2 rounded-lg">
                            <Calendar className="h-5 w-5 text-[#FFD700]" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">
                              {getMonthName(generation.month)} {generation.year}
                            </div>
                            <div className="text-xs font-medium text-gray-500">
                              ID: {generation.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {formatDate(generation.generatedDate)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          {generation.totalPayments} cuotas
                        </div>
                        <div className="text-xs font-medium text-gray-600">
                          {generation.stats.principalSportsCount} principales • {generation.stats.secondarySportsCount} secundarias
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          {formatCurrency(generation.totalAmount)}
                        </div>
                        <div className="text-xs font-medium text-gray-600">
                          Deportivas: {formatCurrency(generation.stats.principalSportsAmount + generation.stats.secondarySportsAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2 min-w-[200px]">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-sm font-bold ${getProgressTextColor(progress.percentage)}`}>
                              {progress.paid}/{progress.total}
                            </span>
                            <span className={`text-xs font-bold ${getProgressTextColor(progress.percentage)}`}>
                              {progress.percentage.toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${getProgressColor(progress.percentage)}`}
                              style={{ width: `${progress.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(generation.status)}
                          <span className={`px-3 py-1.5 text-xs font-bold rounded-lg ${getStatusBadgeClass(generation.status)}`}>
                            {getStatusText(generation.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(generation);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border-2 border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all"
                            title="Ver detalle"
                          >
                            <Eye className="w-4 h-4" />
                            Ver
                          </button>
                          {generation.status === 'active' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (
                                  window.confirm(
                                    '¿Está seguro de que desea revertir esta generación? Esta acción eliminará todas las cuotas generadas.'
                                  )
                                ) {
                                  onRevert(generation.id);
                                }
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-700 rounded-lg text-xs font-bold border-2 border-red-200 hover:bg-red-100 hover:border-red-300 transition-all"
                              title="Revertir generación"
                            >
                              <RotateCcw className="w-4 h-4" />
                              Revertir
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="inline-flex flex-col items-center gap-2 bg-gray-100 border-2 border-gray-200 rounded-xl px-6 py-4">
                      <History className="w-8 h-8 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-500">
                        No hay generaciones registradas
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {generations.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'white',
          padding: '1rem 1.5rem',
          marginTop: '1rem',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e2e8f0',
          gap: '1rem',
          flexWrap: 'wrap' as const
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' as const }}>
            <p style={{
              margin: 0,
              fontSize: '0.875rem',
              color: '#4a5568'
            }}>
              Mostrando{" "}
              <span style={{ fontWeight: 700, color: '#2d3748' }}>{indexOfFirstItem + 1}</span> a{" "}
              <span style={{ fontWeight: 700, color: '#2d3748' }}>
                {Math.min(indexOfLastItem, generations.length)}
              </span>{" "}
              de <span style={{ fontWeight: 700, color: '#2d3748' }}>{generations.length}</span> generaciones
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#4a5568' }}>
              <label htmlFor="itemsPerPage">Mostrar:</label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{
                  padding: '0.375rem 2rem 0.375rem 0.625rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  color: '#2d3748',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
              </select>
            </div>
          </div>

          <nav style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }} aria-label="Pagination">
            <button
              onClick={goToFirstPage}
              disabled={currentPage === 1}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                border: '2px solid #e2e8f0',
                borderRadius: '6px',
                background: 'white',
                color: '#4a5568',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.4 : 1
              }}
              aria-label="Primera página"
            >
              <ChevronLeft className="w-4 h-4" />
              <ChevronLeft className="w-4 h-4" style={{ marginLeft: '-8px' }} />
            </button>
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                border: '2px solid #e2e8f0',
                borderRadius: '6px',
                background: 'white',
                color: '#4a5568',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.4 : 1
              }}
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.5rem 1rem',
              background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
              color: '#FFD700',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.875rem',
              minWidth: '70px',
              justifyContent: 'center'
            }}>
              <span>{currentPage}</span>
              <span style={{ color: '#cbd5e0' }}>/</span>
              <span>{totalPages}</span>
            </div>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                border: '2px solid #e2e8f0',
                borderRadius: '6px',
                background: 'white',
                color: '#4a5568',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.4 : 1
              }}
              aria-label="Página siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                border: '2px solid #e2e8f0',
                borderRadius: '6px',
                background: 'white',
                color: '#4a5568',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.4 : 1
              }}
              aria-label="Última página"
            >
              <ChevronRight className="w-4 h-4" />
              <ChevronRight className="w-4 h-4" style={{ marginLeft: '-8px' }} />
            </button>
          </nav>
        </div>
      )}

      {/* Modal */}
      {selectedGeneration && (
        <GenerationDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          generationId={selectedGeneration.id}
          generationMonth={selectedGeneration.month}
          generationYear={selectedGeneration.year}
        />
      )}
    </>
  );
};