import { useState, useEffect, useCallback } from 'react';
import type { Payment } from '../types';
import { paymentsApi } from '../lib/api/payments';

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await paymentsApi.getAll();
      setPayments(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsPaid = useCallback(async (id: string) => {
    try {
      const updated = await paymentsApi.markAsPaid(id);
      setPayments(prev => prev.map(p => p.id === id ? updated : p));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark payment as paid');
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    payments,
    loading,
    error,
    markAsPaid,
    refreshPayments: fetchPayments
  };
}