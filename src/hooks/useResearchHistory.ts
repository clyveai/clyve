"use client";

import { useCallback } from "react";
import useSWR from "swr";
import { generateResearchTitle } from "@/lib/generateResearchTitle";

interface HistoryItem {
  id: string;
  title: string;
  query: string;
  createdAt: string | Date;
}

interface UseResearchHistoryResult {
  history: HistoryItem[];
  isLoading: boolean;
  isError: boolean;
  mutate: () => Promise<any>;
  addHistory: (query: string, title?: string) => Promise<HistoryItem>;
  deleteHistory: (id: string) => Promise<void>;
  clearHistory: () => Promise<{ deleted: number }>;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch research history");
  }
  return res.json();
};

/**
 * Hook to manage research history.
 * Only fetch if userId is provided (i.e., user is authenticated).
 */
export function useResearchHistory(userId?: string): UseResearchHistoryResult {
  const { data, error, mutate: swrMutate } = useSWR<{ history: HistoryItem[] }>(
    userId ? "/api/research-history" : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    },
  );

  const history = data?.history ?? [];
  const isLoading = !error && !data;
  const isError = !!error;

  const addHistory = useCallback(
    async (query: string, title?: string): Promise<HistoryItem> => {
      const finalTitle = title || generateResearchTitle(query);

      // Optimistically update UI
      const newItem: HistoryItem = {
        id: `temp-${Date.now()}`,
        title: finalTitle,
        query: query,
        createdAt: new Date(),
      };

      const oldData = data;
      const optimisticData = {
        history: [newItem, ...history],
      };

      // Mutate locally with optimistic data
      await swrMutate(optimisticData, false);

      try {
        const res = await fetch("/api/research-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, title: finalTitle }),
        });

        if (!res.ok) {
          throw new Error("Failed to add history");
        }

        const createdItem = await res.json();

        // Revalidate with actual data
        await swrMutate();

        return createdItem;
      } catch (error) {
        // Revert to old data on error
        if (oldData) {
          await swrMutate(oldData, false);
        }
        throw error;
      }
    },
    [data, history, swrMutate],
  );

  const deleteHistory = useCallback(
    async (id: string): Promise<void> => {
      // Optimistically update UI
      const oldData = data;
      const optimisticData = {
        history: history.filter((item) => item.id !== id),
      };

      await swrMutate(optimisticData, false);

      try {
        const res = await fetch(`/api/research-history/${id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          throw new Error("Failed to delete history");
        }

        // Keep optimistic update if successful
        await swrMutate();
      } catch (error) {
        // Revert to old data on error
        if (oldData) {
          await swrMutate(oldData, false);
        }
        throw error;
      }
    },
    [data, history, swrMutate],
  );

  const clearHistory = useCallback(
    async (): Promise<{ deleted: number }> => {
      const oldData = data;
      const optimisticData = { history: [] };

      await swrMutate(optimisticData, false);

      try {
        const res = await fetch("/api/research-history/clear", {
          method: "POST",
        });

        if (!res.ok) {
          throw new Error("Failed to clear history");
        }

        const result = await res.json();

        // Keep optimistic update if successful
        await swrMutate();

        return result;
      } catch (error) {
        // Revert to old data on error
        if (oldData) {
          await swrMutate(oldData, false);
        }
        throw error;
      }
    },
    [data, swrMutate],
  );

  return {
    history,
    isLoading,
    isError,
    mutate: swrMutate,
    addHistory,
    deleteHistory,
    clearHistory,
  };
}
