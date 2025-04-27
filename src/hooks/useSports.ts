import { useState, useEffect, useCallback } from 'react';
import type { Sport } from '../types';
import { sportsApi } from '../lib/api/sports';

export function useSports() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSports = useCallback(async () => {
    try {
      setLoading(true);
      const data = await sportsApi.getAll();
      setSports(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sports');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSport = useCallback(async (id: string) => {
    try {
      await sportsApi.delete(id);
      setSports(prev => prev.filter(sport => sport.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete sport');
    }
  }, []);

  const updateSport = useCallback(async (sport: Sport) => {
    try {
      const updated = await sportsApi.update(sport);
      setSports(prev => prev.map(s => s.id === sport.id ? updated : s));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update sport');
    }
  }, []);

  const createSport = useCallback(async (sport: Omit<Sport, 'id'>) => {
    try {
      const created = await sportsApi.create(sport);
      setSports(prev => [...prev, created]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create sport');
    }
  }, []);

  useEffect(() => {
    fetchSports();
  }, [fetchSports]);

  return {
    sports,
    loading,
    error,
    deleteSport,
    updateSport,
    createSport,
    refreshSports: fetchSports
  };
}