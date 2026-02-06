import { useState, useEffect, useCallback } from "react";
import { cuotesApi } from "../lib/api/cuotes";
import { Quote } from "../lib/types/quote";

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
      console.log("Creating quote:", quote);
      const created = await cuotesApi.create(quote);
      setSocietaryCuotes((prev) => [...prev, ...created]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create quote");
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
  };
}
