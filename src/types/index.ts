// ─── Role Types ───────────────────────────────────────────────
export type RoleName = "Admin" | "Vendor" | "Client" | "Support Staff" | "Broker";

export const ROLE_NAMES: RoleName[] = ["Admin", "Vendor", "Client", "Support Staff", "Broker"];

// ─── User Types ───────────────────────────────────────────────
export interface UserWithRole {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  roleId: string;
  isVerified: boolean;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  role: {
    id: string;
    roleName: RoleName;
  };
}

export interface UserWithProfile extends UserWithRole {
  profile: {
    id: string;
    userId: string;
    profileImage: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    zipCode: string | null;
    bio: string | null;
    companyName: string | null;
    website: string | null;
    department: string | null;
    brokerage: string | null;
    preferences: unknown;
    createdAt: Date;
    updatedAt: Date;
  } | null;
}

// ─── Auth Types ───────────────────────────────────────────────
export interface AuthSession {
  sessionId: string;
  userId: string;
  email: string;
  fullName: string;
  roleName: RoleName;
  roleId: string;
  isVerified: boolean;
  isActive: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  roleName: RoleName;
}

export interface PasswordResetRequest {
  email: string;
  currentPassword: string;
}

export interface PasswordResetData {
  token: string;
  password: string;
  confirmPassword: string;
}

// ─── API Response Types ───────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

// ─── Dashboard Types ──────────────────────────────────────────
export interface SidebarItem {
  title: string;
  href: string;
  icon: string;
  badge?: number;
  children?: SidebarItem[];
}

export interface DashboardStats {
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: string;
}

// ─── Activity Log Types ───────────────────────────────────────
export interface ActivityLogEntry {
  id: string;
  userId: string;
  action: string;
  module: string;
  ipAddress: string | null;
  createdAt: Date;
  user?: {
    fullName: string;
    email: string;
  };
}

// ─── Session Types ────────────────────────────────────────────
export interface SessionEntry {
  id: string;
  userId: string;
  ipAddress: string | null;
  userAgent: string | null;
  expiresAt: Date;
  createdAt: Date;
  isCurrent?: boolean;
}