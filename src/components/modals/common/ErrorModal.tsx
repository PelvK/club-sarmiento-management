import React from 'react';
import { ConfirmationModal } from './confirmationModal/component';
import { ParsedError } from '../../../lib/utils/errorHandler';

export interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: ParsedError;
  showDetails?: boolean;
}

/**
 * Modal especializado para mostrar errores usando el ConfirmationModal
 */
export const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  error,
  showDetails = false,
}) => {
  const handleConfirm = () => {
    // En errores, el botón de confirmar solo cierra el modal
    onClose();
  };

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title={error.title}
      message={
        showDetails && error.originalError
          ? `${error.message}\n\nDetalles técnicos: ${error.originalError}`
          : error.message
      }
      confirmText="Entendido"
      cancelText="Cerrar"
      type={error.type}
    />
  );
};