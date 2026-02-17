import React, { useState, useMemo } from 'react';
import { Calendar, RotateCcw, CheckCircle, XCircle, Eye, History } from 'lucide-react';
import { PaymentGeneration, Payment } from '../../../lib/types/payment';
import { GenerationDetailsModal } from '../../modals/payments/GenerationDetailsModal';
import './styles.css';

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
      ? <CheckCircle className="status-icon status-icon-active" />
      : <XCircle className="status-icon status-icon-inactive" />;
  };

  const getStatusText = (status: string) => {
    return status === 'active' ? 'Activa' : 'Revertida';
  };

  const getStatusBadgeClass = (status: string) => {
    return status === 'active' ? 'generation-status-active' : 'generation-status-inactive';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'progress-bar-high';
    if (percentage >= 50) return 'progress-bar-medium';
    if (percentage >= 20) return 'progress-bar-low';
    return 'progress-bar-critical';
  };

  const getProgressTextColor = (percentage: number) => {
    if (percentage >= 80) return 'progress-text-high';
    if (percentage >= 50) return 'progress-text-medium';
    if (percentage >= 20) return 'progress-text-low';
    return 'progress-text-critical';
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
      <div className="generation-history-container">
        <div className="generation-history-card">
          <div className="generation-history-header">
            <h3 className="generation-history-title">
              <History className="w-5 h-5" />
              Historial de Generaciones
            </h3>
          </div>

          <div className="table-wrapper">
            <table className="generation-table">
              <thead>
                <tr>
                  <th>Período</th>
                  <th>Fecha de Generación</th>
                  <th>Cuotas Generadas</th>
                  <th>Monto Total</th>
                  <th>Progreso de Pagos</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {generations.length > 0 ? (
                  generations.map((generation) => {
                    const progress = getGenerationProgress(generation.id);
                    return (
                      <tr
                        key={generation.id}
                        className="generation-row"
                        onClick={() => handleRowClick(generation)}
                      >
                        <td>
                          <div className="period-cell">
                            <div className="period-icon">
                              <Calendar className="w-5 h-5" />
                            </div>
                            <div className="period-info">
                              <div className="period-name">
                                {getMonthName(generation.month)} {generation.year}
                              </div>
                              <div className="period-id">
                                ID: {generation.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="generation-date">
                            {formatDate(generation.generatedDate)}
                          </span>
                        </td>
                        <td>
                          <div className="quotas-info">
                            <div className="quotas-total">
                              {generation.totalPayments} cuotas
                            </div>
                            <div className="quotas-breakdown">
                              {generation.stats.principalSportsCount} principales • {generation.stats.secondarySportsCount} secundarias
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="amount-info">
                            <div className="amount-total">
                              {formatCurrency(generation.totalAmount)}
                            </div>
                            <div className="amount-sports">
                              Deportivas: {formatCurrency(generation.stats.principalSportsAmount + generation.stats.secondarySportsAmount)}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="progress-container">
                            <div className="progress-header">
                              <span className={`progress-count ${getProgressTextColor(progress.percentage)}`}>
                                {progress.paid}/{progress.total}
                              </span>
                              <span className={`progress-percentage ${getProgressTextColor(progress.percentage)}`}>
                                {progress.percentage.toFixed(0)}%
                              </span>
                            </div>
                            <div className="progress-bar-wrapper">
                              <div
                                className={`progress-bar-fill ${getProgressColor(progress.percentage)}`}
                                style={{ width: `${progress.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="status-cell">
                            {getStatusIcon(generation.status)}
                            <span className={`status-badge ${getStatusBadgeClass(generation.status)}`}>
                              {getStatusText(generation.status)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowClick(generation);
                              }}
                              className="action-btn action-btn-view"
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
                                className="action-btn action-btn-revert"
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
                    <td colSpan={7} className="empty-state">
                      <div className="empty-state-content">
                        <History className="empty-state-icon" />
                        <p className="empty-state-title">No hay generaciones registradas</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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