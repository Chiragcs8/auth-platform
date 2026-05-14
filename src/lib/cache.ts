/**
 * Server-side in-memory cache with TTL support.
 * Reduces PostgreSQL calls on frequently-accessed data like
 * dashboard stats, user lists, roles, and activity logs.
 *
 * Each cache entry has a configurable TTL (time-to-live).
 * Expired entries are automatically evicted on read.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class ServerCache {
  private cache = new Map<string, CacheEntry<unknown>>();

  /**
   * Get a cached value by key. Returns null if not found or expired.
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set a cached value with a TTL in milliseconds.
   */
  set<T>(key: string, data: T, ttlMs: number): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl: ttlMs });
  }

  /**
   * Get a cached value, or compute and cache it if not found/expired.
   * This is the primary method for API routes — it avoids redundant DB queries.
   */
  async getOrSet<T>(key: string, compute: () => Promise<T>, ttlMs: number): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) return cached;

    const data = await compute();
    this.set(key, data, ttlMs);
    return data;
  }

  /**
   * Invalidate a specific cache key (e.g., when data is mutated).
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate all keys matching a prefix pattern.
   * Useful when a mutation affects multiple related caches.
   */
  invalidatePattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Invalidate all cache entries for a specific user.
   */
  invalidateUser(userId: string): void {
    this.invalidatePattern(`user:${userId}`);
  }

  /**
   * Clear the entire cache.
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics for monitoring.
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Singleton instance shared across all server-side code
export const serverCache = new ServerCache();

// ─── Cache TTL Constants ──────────────────────────────────────
// Shorter TTLs for frequently-changing data, longer for stable data

export const CACHE_TTL = {
  DASHBOARD_STATS: 60_000,       // 1 minute — stats change moderately
  USER_LIST: 30_000,             // 30 seconds — users can be added/deactivated
  ROLE_LIST: 5 * 60_000,        // 5 minutes — roles rarely change
  ACTIVITY_LOGS: 30_000,        // 30 seconds — new logs are created frequently
  PROFILE: 60_000,              // 1 minute — profile updates are infrequent
  SESSIONS: 15_000,             // 15 seconds — sessions can be revoked
  TICKETS: 30_000,              // 30 seconds — tickets change status
  RELATIONS: 60_000,            // 1 minute — broker relationships are stable
  USER_LOOKUP: 30_000,          // 30 seconds
  VENDOR_ANALYTICS: 2 * 60_000, // 2 minutes — analytics are computed
} as const;

// ─── Cache Key Builders ───────────────────────────────────────
// Consistent key format: `namespace:identifier`

export function dashboardCacheKey(role: string): string {
  return `dashboard:${role}`;
}

export function userListCacheKey(): string {
  return `admin:users`;
}

export function roleListCacheKey(): string {
  return `admin:roles`;
}

export function activityLogsCacheKey(userId?: string): string {
  return userId ? `activity:${userId}` : `admin:activity`;
}

export function profileCacheKey(userId: string): string {
  return `profile:${userId}`;
}

export function sessionsCacheKey(userId: string): string {
  return `sessions:${userId}`;
}