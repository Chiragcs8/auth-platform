/**
 * Prefetch utility — called at login to preload user-related data
 * into the client-side Zustand data store.
 *
 * After successful login, we fire off parallel fetch requests for:
 * - Role-specific dashboard stats
 * - User profile
 * - User sessions
 * - Role-specific feature data (tickets, relationships, etc.)
 *
 * This ensures that when the user arrives at their dashboard,
 * the data is already available in cache for instant rendering.
 */

"use client";

import { useDataStore, CLIENT_TTL, dashboardKey, profileKey, sessionsKey, ticketsKey, relationsKey, usersKey, rolesKey, activityKey, vendorAnalyticsKey } from "@/store/data-store";
import type { RoleName } from "@/types";

/**
 * Prefetch all role-specific data after login.
 * Called from the login page after a successful login response.
 * All requests are fired in parallel and cached in the data store.
 */
export async function prefetchUserData(roleName: RoleName, userId: string): Promise<void> {
  const store = useDataStore.getState();

  // Common data all users need
  const commonFetches = [
    prefetchProfile(userId, store),
    prefetchSessions(userId, store),
  ];

  // Role-specific data
  const roleFetches = getRoleFetches(roleName, userId, store);

  // Fire all requests in parallel — don't block navigation
  await Promise.allSettled([...commonFetches, ...roleFetches]);
}

function getRoleFetches(roleName: RoleName, userId: string, store: ReturnType<typeof useDataStore.getState>): Promise<void>[] {
  switch (roleName) {
    case "Admin":
      return [
        prefetchDashboard("admin", store),
        prefetchUsers(store),
        prefetchRoles(store),
        prefetchActivityLogs(undefined, store),
      ];
    case "Vendor":
      return [
        prefetchDashboard("vendor", store),
        prefetchVendorAnalytics(store),
      ];
    case "Client":
      return [
        prefetchDashboard("client", store),
        prefetchActivityLogs(userId, store),
      ];
    case "Support Staff":
      return [
        prefetchDashboard("support", store),
        prefetchTickets(store),
      ];
    case "Broker":
      return [
        prefetchDashboard("broker", store),
        prefetchRelations(store),
      ];
    default:
      return [prefetchDashboard("client", store)];
  }
}

async function prefetchDashboard(role: string, store: ReturnType<typeof useDataStore.getState>): Promise<void> {
  const key = dashboardKey(role);
  if (store.isFresh(key)) return;

  try {
    const res = await fetch(`/api/${role}/dashboard`);
    if (res.ok) {
      const data = await res.json();
      store.set(key, data, CLIENT_TTL.DASHBOARD_STATS);
    }
  } catch {
    // Prefetch failures are non-critical — data will be fetched on page load
  }
}

async function prefetchProfile(userId: string, store: ReturnType<typeof useDataStore.getState>): Promise<void> {
  const key = profileKey(userId);
  if (store.isFresh(key)) return;

  try {
    const res = await fetch("/api/profile");
    if (res.ok) {
      const data = await res.json();
      store.set(key, data, CLIENT_TTL.PROFILE);
    }
  } catch {
    // Non-critical
  }
}

async function prefetchSessions(userId: string, store: ReturnType<typeof useDataStore.getState>): Promise<void> {
  const key = sessionsKey(userId);
  if (store.isFresh(key)) return;

  try {
    const res = await fetch("/api/sessions");
    if (res.ok) {
      const data = await res.json();
      store.set(key, data, CLIENT_TTL.SESSIONS);
    }
  } catch {
    // Non-critical
  }
}

async function prefetchUsers(store: ReturnType<typeof useDataStore.getState>): Promise<void> {
  const key = usersKey();
  if (store.isFresh(key)) return;

  try {
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const data = await res.json();
      store.set(key, data, CLIENT_TTL.USER_LIST);
    }
  } catch {
    // Non-critical
  }
}

async function prefetchRoles(store: ReturnType<typeof useDataStore.getState>): Promise<void> {
  const key = rolesKey();
  if (store.isFresh(key)) return;

  try {
    const res = await fetch("/api/admin/roles");
    if (res.ok) {
      const data = await res.json();
      store.set(key, data, CLIENT_TTL.ROLE_LIST);
    }
  } catch {
    // Non-critical
  }
}

async function prefetchActivityLogs(userId: string | undefined, store: ReturnType<typeof useDataStore.getState>): Promise<void> {
  const key = activityKey(userId);
  if (store.isFresh(key)) return;

  try {
    const url = userId ? "/api/activity" : "/api/admin/activity-logs";
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      store.set(key, data, CLIENT_TTL.ACTIVITY_LOGS);
    }
  } catch {
    // Non-critical
  }
}

async function prefetchTickets(store: ReturnType<typeof useDataStore.getState>): Promise<void> {
  const key = ticketsKey();
  if (store.isFresh(key)) return;

  try {
    const res = await fetch("/api/support/tickets");
    if (res.ok) {
      const data = await res.json();
      store.set(key, data, CLIENT_TTL.TICKETS);
    }
  } catch {
    // Non-critical
  }
}

async function prefetchRelations(store: ReturnType<typeof useDataStore.getState>): Promise<void> {
  const key = relationsKey();
  if (store.isFresh(key)) return;

  try {
    const res = await fetch("/api/broker/relationships");
    if (res.ok) {
      const data = await res.json();
      store.set(key, data, CLIENT_TTL.RELATIONS);
    }
  } catch {
    // Non-critical
  }
}

async function prefetchVendorAnalytics(store: ReturnType<typeof useDataStore.getState>): Promise<void> {
  const key = vendorAnalyticsKey();
  if (store.isFresh(key)) return;

  try {
    // Vendor analytics is part of the vendor dashboard data
    // No separate API exists yet, so we skip this
  } catch {
    // Non-critical
  }
}