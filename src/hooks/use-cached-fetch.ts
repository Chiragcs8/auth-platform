/**
 * useCachedFetch — React hook for data fetching with client-side caching.
 *
 * Implements a stale-while-revalidate pattern:
 * 1. If fresh data exists in the Zustand data store, return it immediately (no network request).
 * 2. If stale data exists, return it immediately but trigger a background revalidation.
 * 3. If no data exists, show loading state and fetch from the API.
 *
 * This avoids redundant network requests on page navigation and
 * provides instant UI renders when switching between dashboard tabs.
 */

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useDataStore, CLIENT_TTL } from "@/store/data-store";

interface UseCachedFetchOptions {
  /** Cache TTL in milliseconds. Defaults depend on the data type. */
  ttl?: number;
  /** Whether to fetch on mount. Default: true */
  fetchOnMount?: boolean;
  /** Whether to revalidate stale data in the background. Default: true */
  revalidate?: boolean;
}

interface UseCachedFetchResult<T> {
  /** The data (may be stale but still valid for instant render) */
  data: T | null;
  /** Whether a network fetch is in progress (first-time or forced) */
  loading: boolean;
  /** Whether a background revalidation is happening (data is already shown) */
  revalidating: boolean;
  /** Any error from the fetch */
  error: string | null;
  /** Force a fresh fetch, bypassing cache */
  refetch: () => Promise<void>;
}

export function useCachedFetch<T>(
  cacheKey: string,
  fetchUrl: string,
  options: UseCachedFetchOptions = {}
): UseCachedFetchResult<T> {
  const { ttl = CLIENT_TTL.DASHBOARD_STATS, fetchOnMount = true, revalidate = true } = options;

  const store = useDataStore();
  const [loading, setLoading] = useState(false);
  const [revalidating, setRevalidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localData, setLocalData] = useState<T | null>(null);
  const mountedRef = useRef(false);

  // Check cache state
  const cachedFresh = store.get<T>(cacheKey);
  const cachedStale = store.getStale<T>(cacheKey);
  const isPending = store.isPending(cacheKey);

  // Determine what data to show
  const displayData = cachedFresh ?? cachedStale ?? localData;

  const doFetch = useCallback(async (isRevalidation: boolean) => {
    // Prevent duplicate fetches
    if (store.isPending(cacheKey)) return;

    store.setPending(cacheKey, true);

    if (isRevalidation) {
      setRevalidating(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const res = await fetch(fetchUrl);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to fetch data");
      }

      const data = await res.json();
      // Error responses (success: false) are not cached — throw instead
      if (!data.success) throw new Error(data.message || "API returned an error");
      // Cache all data fields (excluding the success flag) so components
      // can access multiple fields like stats + recentActivity
      const { success: _, ...extracted } = data;

      store.set(cacheKey, extracted, ttl);
      setLocalData(extracted);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
      setRevalidating(false);
      store.setPending(cacheKey, false);
    }
  }, [cacheKey, fetchUrl, ttl, store]);

  const refetch = useCallback(async () => {
    store.invalidate(cacheKey);
    await doFetch(false);
  }, [cacheKey, doFetch, store]);

  useEffect(() => {
    if (!fetchOnMount) return;

    // If we have fresh data, no need to fetch
    if (cachedFresh !== null) return;

    // If we have stale data, show it and revalidate in background
    if (cachedStale !== null && revalidate) {
      if (!mountedRef.current) {
        mountedRef.current = true;
        doFetch(true);
      }
      return;
    }

    // No data at all — do a full fetch
    if (!isPending) {
      doFetch(false);
    }
  }, [fetchOnMount, cacheKey, cachedFresh, cachedStale, revalidate, isPending, doFetch]);

  return {
    data: displayData,
    loading,
    revalidating,
    error,
    refetch,
  };
}