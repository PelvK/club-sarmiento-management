import { useState, useCallback } from 'react';
import { parseApiError, ParsedError } from '../lib/utils/errorHandler';

/**
 * Hook personalizado para manejar errores con modal
 */
export function useErrorHandler() {
  const [error, setError] = useState<ParsedError | null>(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  /**
   * Maneja un error y muestra el modal
   */
  const handleError = useCallback((err: unknown) => {
    const parsedError = parseApiError(err);
    setError(parsedError);
    setIsErrorModalOpen(true);
  }, []);

  /**
   * Cierra el modal de error
   */
  const closeErrorModal = useCallback(() => {
    setIsErrorModalOpen(false);
    // Limpiamos el error después de cerrar la animación
    setTimeout(() => setError(null), 300);
  }, []);

  /**
   * Limpia el error sin mostrar modal
   */
  const clearError = useCallback(() => {
    setError(null);
    setIsErrorModalOpen(false);
  }, []);

  return {
    error,
    isErrorModalOpen,
    handleError,
    closeErrorModal,
    clearError,
  };
}