import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth';
import { DashboardLayoutClient } from '@/components/dashboard/dashboard-layout-client';
import type { RoleName, AuthSession } from '@/types';

export default async function SupportLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    redirect('/login');
  }

  const payload = await verifyAccessToken(accessToken);

  if (!payload) {
    redirect('/login');
  }

  if (payload.roleName !== 'Support Staff') {
    redirect('/login');
  }

  const session: AuthSession = {
    sessionId: payload.sessionId,
    userId: payload.userId,
    roleId: payload.roleId,
    roleName: payload.roleName as RoleName,
    email: payload.email,
    fullName: payload.fullName,
    isVerified: payload.isVerified,
    isActive: payload.isActive,
  };

  return (
    <DashboardLayoutClient initialSession={session} roleName="Support Staff">
      {children}
    </DashboardLayoutClient>
  );
}