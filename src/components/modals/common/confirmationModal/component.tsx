import React from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import './confirmationModal.styles.css';

export type ConfirmationType = 'warning' | 'danger' | 'success' | 'info';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmationType;
  isLoading?: boolean;
}

const iconMap = {
  warning: AlertTriangle,
  danger: XCircle,
  success: CheckCircle,
  info: Info,
};

const colorMap = {
  warning: '#f59e0b',
  danger: '#ef4444',
  success: '#10b981',
  info: '#3b82f6',
};

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'info',
  isLoading = false,
}) => {
  const Icon = iconMap[type];

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="confirmation-modal-overlay" onClick={onClose}>
      <div
        className="confirmation-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirmation-modal-header">
          <div
            className={`confirmation-icon-wrapper confirmation-icon-${type}`}
            style={{ backgroundColor: `${colorMap[type]}15` }}
          >
            <Icon
              className="confirmation-icon"
              style={{ color: colorMap[type] }}
            />
          </div>
        </div>

        <div className="confirmation-modal-body">
          <h3 className="confirmation-title">{title}</h3>
          <p className="confirmation-message">{message}</p>
        </div>

        <div className="confirmation-modal-footer">
          <button
            type="button"
            className="confirmation-btn confirmation-btn-cancel"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`confirmation-btn confirmation-btn-confirm confirmation-btn-${type}`}
            onClick={handleConfirm}
            disabled={isLoading}
            style={{ backgroundColor: colorMap[type] }}
          >
            {isLoading ? 'Procesando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};