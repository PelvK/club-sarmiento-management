import { useState, useEffect, useCallback } from 'react';
import type { PaymentMovement } from '../types';
import { movementsApi } from '../lib/api/movements';

export function useMovements() {
  const [movements, setMovements] = useState<PaymentMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMovements = useCallback(async () => {
    try {
      setLoading(true);
      const data = await movementsApi.getAll();
      setMovements(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch movements');
    } finally {
      setLoading(false);
    }
  }, []);

  const getMovementsByPayment = useCallback(async (paymentId: string) => {
    try {
      const data = await movementsApi.getByPayment(paymentId);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payment movements');
      return [];
    }
  }, []);

  const getMovementsByMember = useCallback(async (memberName: string, memberDni?: string) => {
    try {
      const data = await movementsApi.getByMember(memberName, memberDni);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch member movements');
      return [];
    }
  }, []);

  const createMovement = useCallback(async (movement: Omit<PaymentMovement, 'id' | 'timestamp'>) => {
    try {
      const created = await movementsApi.create(movement);
      setMovements(prev => [created, ...prev]);
      return created;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create movement');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  return {
    movements,
    loading,
    error,
    getMovementsByPayment,
    getMovementsByMember,
    createMovement,
    refreshMovements: fetchMovements
  };
}