import { useState, useEffect, useCallback } from "react";
import { cuotesApi } from "../lib/api/cuotes";
import { Quote } from "../lib/types/quote";
import { CONSOLE_LOG } from "../lib/utils/consts";

export function useCuotes() {
  const [societaryCuotes, setSocietaryCuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSocietaryCuotes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await cuotesApi.getSocietaryCuotes();
      setSocietaryCuotes(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch sports");
    } finally {
      setLoading(false);
    }
  }, []);

  const createSocietaryQuote = useCallback(async (quote: Quote[]) => {
    try {
      if (CONSOLE_LOG) {
        console.log("Creating quote:", quote);
      }
      const created = await cuotesApi.create(quote);
      setSocietaryCuotes((prev) => [...prev, ...created]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create quote");
      throw err;
    }
  }, []);

  const updateSocietaryQuote = useCallback(async (quote: Quote) => {
    try {
      if (CONSOLE_LOG) {
        console.log("Updating quote:", quote);
      }
      const updated = await cuotesApi.update(quote);
      setSocietaryCuotes((prev) =>
        prev.map((q) => (q.id === updated.id ? {...q, ...updated} : q))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update quote");
      throw err;
    }
  }, []);

  const deleteSocietaryQuote = useCallback(async (id: number) => {
    try {
      if (CONSOLE_LOG) {
        console.log("Deleting quote:", id);
      }
      await cuotesApi.delete(id);
      setSocietaryCuotes((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete quote");
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchSocietaryCuotes();
  }, [fetchSocietaryCuotes]);

  return {
    societaryCuotes,
    loading,
    error,
    refreshSocietaryCuotes: fetchSocietaryCuotes,
    createSocietaryQuote,
    updateSocietaryQuote,
    deleteSocietaryQuote,
  };
}
