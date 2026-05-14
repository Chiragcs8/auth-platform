import { create } from "zustand";
import type { AuthSession, RoleName } from "@/types";

interface AuthState {
  session: AuthSession | null;
  isLoading: boolean;
  setSession: (session: AuthSession | null) => void;
  setLoading: (loading: boolean) => void;
  clearSession: () => void;
  isAdmin: () => boolean;
  isVendor: () => boolean;
  isClient: () => boolean;
  isSupport: () => boolean;
  isBroker: () => boolean;
  hasRole: (role: RoleName) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  isLoading: true,

  setSession: (session) => set({ session, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  clearSession: () => set({ session: null, isLoading: false }),

  isAdmin: () => get().session?.roleName === "Admin",
  isVendor: () => get().session?.roleName === "Vendor",
  isClient: () => get().session?.roleName === "Client",
  isSupport: () => get().session?.roleName === "Support Staff",
  isBroker: () => get().session?.roleName === "Broker",
  hasRole: (role) => get().session?.roleName === role,
}));