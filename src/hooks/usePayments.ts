import { useState, useEffect, useCallback } from 'react';
import { paymentsApi } from '../lib/api/payments';
import { Payment } from '../lib/types/payment';
import { PaymentGeneration } from '../types';
import { GenerationConfig } from '../lib/types';

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [generations, setGenerations] = useState<PaymentGeneration[]>([]);
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

  const fetchGenerations = useCallback(async () => {
    try {
      const data = await paymentsApi.getGenerations();
      setGenerations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch generations');
    }
  }, []);

  const markAsPaid = useCallback(async (id: number, amount?: number, notes?: string) => {
    try {
      const updated = await paymentsApi.markAsPaid(id, amount, notes);
      setPayments(prev => prev.map(p => p.member.id === id ? updated : p));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark payment as paid');
    }
  }, []);

  const addPartialPayment = useCallback(async (paymentId: number, amount: number, notes?: string) => {
    try {
      const updated = await paymentsApi.addPartialPayment(paymentId, amount, notes);
      setPayments(prev => prev.map(p => p.id === paymentId ? updated : p));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add partial payment');
    }
  }, []);

  const generatePayments = useCallback(async (config: GenerationConfig) => {
    try {
      const generation = await paymentsApi.generatePayments(config);
      setGenerations(prev => [generation, ...prev]);
      await fetchPayments();
      return generation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate payments');
      throw err;
    }
  }, [fetchPayments]);

  const revertGeneration = useCallback(async (generationId: string) => {
    try {
      await paymentsApi.revertGeneration(generationId);
      setGenerations(prev => prev.map(g => 
        g.id === generationId ? { ...g, status: 'reverted' as const } : g
      ));
      await fetchPayments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revert generation');
    }
  }, [fetchPayments]);

  const updatePayment = useCallback(async (payment: Payment) => {
    try {
      const updated = await paymentsApi.updatePayment(payment);
      setPayments(prev => prev.map(p => p.id === payment.id ? updated : p));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update payment');
    }
  }, []);

  useEffect(() => {
    fetchPayments();
    fetchGenerations();
  }, [fetchPayments, fetchGenerations]);

  return {
    payments,
    generations,
    loading,
    error,
    markAsPaid,
    addPartialPayment,
    generatePayments,
    revertGeneration,
    updatePayment,
    refreshPayments: fetchPayments,
    refreshGenerations: fetchGenerations
  };
}