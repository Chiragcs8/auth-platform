/**
 * Client-side data cache store using Zustand.
 * Caches API responses to avoid redundant network requests on
 * page navigation, tab switching, and dashboard re-entry.
 *
 * Data is prefetched at login and served from cache whenever possible.
 * Stale data is automatically revalidated on a configurable TTL.
 */

import { create } from "zustand";
import type { AuthSession } from "@/types";

// ─── Cache Entry Types ────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
}

interface DataState {
  // Cached data keyed by cache key
  cache: Record<string, CacheEntry<unknown>>;
  // Track which keys are currently being fetched (prevent duplicate requests)
  pending: Record<string, boolean>;
  // Session reference for prefetching
  session: AuthSession | null;
}

interface DataActions {
  // Get cached data if fresh, null if stale or missing
  get<T>(key: string): T | null;
  // Get cached data regardless of staleness (for instant UI render)
  getStale<T>(key: string): T | null;
  // Set cache entry
  set<T>(key: string, data: T, ttl: number): void;
  // Check if data is fresh (within TTL)
  isFresh(key: string): boolean;
  // Check if a fetch is already in progress for this key
  isPending(key: string): boolean;
  // Mark a key as pending (fetch in progress)
  setPending(key: string, pending: boolean): void;
  // Invalidate a specific key
  invalidate(key: string): void;
  // Invalidate all keys matching a prefix
  invalidatePattern(pattern: string): void;
  // Set session and trigger prefetch
  setSession: (session: AuthSession | null) => void;
  // Clear all cache (on logout)
  clearAll: () => void;
}

// ─── TTL Constants (client-side, slightly longer than server) ──

const CLIENT_TTL = {
  DASHBOARD_STATS: 90_000,       // 1.5 minutes
  USER_LIST: 45_000,             // 45 seconds
  ROLE_LIST: 5 * 60_000,        // 5 minutes
  ACTIVITY_LOGS: 45_000,        // 45 seconds
  PROFILE: 90_000,              // 1.5 minutes
  SESSIONS: 30_000,             // 30 seconds
  TICKETS: 45_000,              // 45 seconds
  RELATIONS: 90_000,            // 1.5 minutes
  USER_LOOKUP: 45_000,          // 45 seconds
  VENDOR_ANALYTICS: 2 * 60_000, // 2 minutes
} as const;

export { CLIENT_TTL };

// ─── Cache Key Helpers ────────────────────────────────────────

export function dashboardKey(role: string): string {
  return `dashboard:${role}`;
}

export function usersKey(): string {
  return "admin:users";
}

export function rolesKey(): string {
  return "admin:roles";
}

export function activityKey(userId?: string): string {
  return userId ? `activity:${userId}` : "admin:activity";
}

export function profileKey(userId: string): string {
  return `profile:${userId}`;
}

export function sessionsKey(userId: string): string {
  return `sessions:${userId}`;
}

export function ticketsKey(): string {
  return "support:tickets";
}

export function relationsKey(): string {
  return "broker:relationships";
}

export function userLookupKey(query: string): string {
  return `support:lookup:${query}`;
}

export function vendorAnalyticsKey(): string {
  return "vendor:analytics";
}

// ─── Store ────────────────────────────────────────────────────

export const useDataStore = create<DataState & DataActions>((set, get) => ({
  cache: {},
  pending: {},
  session: null,

  get<T>(key: string): T | null {
    const entry = get().cache[key];
    if (!entry) return null;
    if (Date.now() - entry.timestamp > entry.ttl) return null;
    return entry.data as T;
  },

  getStale<T>(key: string): T | null {
    const entry = get().cache[key];
    if (!entry) return null;
    return entry.data as T;
  },

  set<T>(key: string, data: T, ttl: number): void {
    set((state) => ({
      cache: {
        ...state.cache,
        [key]: { data, timestamp: Date.now(), ttl },
      },
      pending: {
        ...state.pending,
        [key]: false,
      },
    }));
  },

  isFresh(key: string): boolean {
    const entry = get().cache[key];
    if (!entry) return false;
    return Date.now() - entry.timestamp <= entry.ttl;
  },

  isPending(key: string): boolean {
    return get().pending[key] === true;
  },

  setPending(key: string, pending: boolean): void {
    set((state) => ({
      pending: { ...state.pending, [key]: pending },
    }));
  },

  invalidate(key: string): void {
    set((state) => {
      const newCache = { ...state.cache };
      delete newCache[key];
      return { cache: newCache };
    });
  },

  invalidatePattern(pattern: string): void {
    set((state) => {
      const newCache = { ...state.cache };
      for (const key of Object.keys(newCache)) {
        if (key.startsWith(pattern)) delete newCache[key];
      }
      return { cache: newCache };
    });
  },

  setSession: (session: AuthSession | null) => {
    set({ session });
    if (!session) {
      get().clearAll();
    }
  },

  clearAll: () => {
    set({ cache: {}, pending: {}, session: null });
  },
}));