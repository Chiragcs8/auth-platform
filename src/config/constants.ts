import type { RoleName, SidebarItem } from "@/types";

// ─── App Constants ────────────────────────────────────────────
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "AuthPlatform";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// ─── Route Constants ──────────────────────────────────────────
export const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

export const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

export const ROLE_DASHBOARD_MAP: Record<RoleName, string> = {
  Admin: "/admin/dashboard",
  Vendor: "/vendor/dashboard",
  Client: "/client/dashboard",
  "Support Staff": "/support/dashboard",
  Broker: "/broker/dashboard",
};

export const ROLE_ROUTE_PREFIX: Record<RoleName, string> = {
  Admin: "/admin",
  Vendor: "/vendor",
  Client: "/client",
  "Support Staff": "/support",
  Broker: "/broker",
};

// ─── Sidebar Navigation ──────────────────────────────────────
export const ADMIN_SIDEBAR: SidebarItem[] = [
  { title: "Dashboard", href: "/admin/dashboard", icon: "LayoutDashboard" },
  { title: "Users", href: "/admin/users", icon: "Users" },
  { title: "Roles", href: "/admin/roles", icon: "Shield" },
  { title: "Activity Logs", href: "/admin/activity-logs", icon: "Activity" },
  { title: "Profile", href: "/admin/profile", icon: "UserCircle" },
  { title: "Security", href: "/admin/security", icon: "Lock" },
  { title: "Sessions", href: "/admin/sessions", icon: "Key" },
];

export const VENDOR_SIDEBAR: SidebarItem[] = [
  { title: "Dashboard", href: "/vendor/dashboard", icon: "LayoutDashboard" },
  { title: "Analytics", href: "/vendor/analytics", icon: "BarChart3" },
  { title: "Profile", href: "/vendor/profile", icon: "UserCircle" },
  { title: "Security", href: "/vendor/security", icon: "Lock" },
  { title: "Sessions", href: "/vendor/sessions", icon: "Key" },
];

export const CLIENT_SIDEBAR: SidebarItem[] = [
  { title: "Dashboard", href: "/client/dashboard", icon: "LayoutDashboard" },
  { title: "Profile", href: "/client/profile", icon: "UserCircle" },
  { title: "Activity", href: "/client/activity", icon: "Activity" },
  { title: "Security", href: "/client/security", icon: "Lock" },
  { title: "Sessions", href: "/client/sessions", icon: "Key" },
];

export const SUPPORT_SIDEBAR: SidebarItem[] = [
  { title: "Dashboard", href: "/support/dashboard", icon: "LayoutDashboard" },
  { title: "Tickets", href: "/support/tickets", icon: "TicketCheck" },
  { title: "User Lookup", href: "/support/user-lookup", icon: "Search" },
  { title: "Activity Center", href: "/support/activity-center", icon: "Activity" },
  { title: "Profile", href: "/support/profile", icon: "UserCircle" },
  { title: "Security", href: "/support/security", icon: "Lock" },
  { title: "Sessions", href: "/support/sessions", icon: "Key" },
];

export const BROKER_SIDEBAR: SidebarItem[] = [
  { title: "Dashboard", href: "/broker/dashboard", icon: "LayoutDashboard" },
  { title: "Relationships", href: "/broker/relationships", icon: "Handshake" },
  { title: "Analytics", href: "/broker/analytics", icon: "BarChart3" },
  { title: "Profile", href: "/broker/profile", icon: "UserCircle" },
  { title: "Security", href: "/broker/security", icon: "Lock" },
  { title: "Sessions", href: "/broker/sessions", icon: "Key" },
];

export const ROLE_SIDEBAR_MAP: Record<RoleName, SidebarItem[]> = {
  Admin: ADMIN_SIDEBAR,
  Vendor: VENDOR_SIDEBAR,
  Client: CLIENT_SIDEBAR,
  "Support Staff": SUPPORT_SIDEBAR,
  Broker: BROKER_SIDEBAR,
};

// ─── Token Expiry ─────────────────────────────────────────────
export const ACCESS_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const REFRESH_TOKEN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
export const PASSWORD_RESET_EXPIRY_MS = 1 * 60 * 60 * 1000; // 1 hour