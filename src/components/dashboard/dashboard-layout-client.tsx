'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { ROLE_SIDEBAR_MAP } from '@/config/constants';
import type { AuthSession, RoleName } from '@/types';

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  initialSession: AuthSession | null;
  roleName: RoleName;
}

export function DashboardLayoutClient({ children, initialSession, roleName }: DashboardLayoutClientProps) {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(initialSession);

  useEffect(() => {
    if (!initialSession) {
      router.push('/login');
      return;
    }

    // Verify role access
    if (initialSession.roleName !== roleName) {
      const correctPath = ROLE_SIDEBAR_MAP[initialSession.roleName]?.[0]?.href || '/login';
      router.push(correctPath);
      return;
    }

    // Refresh session from API
    const refreshSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const result = await res.json();
        if (result.success && result.data) {
          setSession(result.data);
        } else {
          router.push('/login');
        }
      } catch {
        // Use initial session if API fails
        setSession(initialSession);
      }
    };

    refreshSession();
  }, [initialSession, roleName, router]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const sidebarItems = ROLE_SIDEBAR_MAP[roleName];

  return (
    <DashboardShell sidebarItems={sidebarItems} session={session}>
      {children}
    </DashboardShell>
  );
}