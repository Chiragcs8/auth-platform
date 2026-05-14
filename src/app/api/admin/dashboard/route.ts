import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { serverCache, CACHE_TTL, dashboardCacheKey } from '@/lib/cache';

export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.roleName !== 'Admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const data = await serverCache.getOrSet(dashboardCacheKey('admin'), async () => {
      // Get user stats
      const totalUsers = await prisma.user.count();
      const activeUsers = await prisma.user.count({ where: { isActive: true } });
      const inactiveUsers = await prisma.user.count({ where: { isActive: false } });
      const totalRoles = await prisma.role.count();
      const pendingVerifications = await prisma.user.count({ where: { isVerified: false } });

      // Get recent logins (last 24 hours)
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentLogins = await prisma.activityLog.count({
        where: {
          action: 'LOGIN_SUCCESS',
          createdAt: { gte: yesterday },
        },
      });

      // Get recent activity
      const recentActivity = await prisma.activityLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { fullName: true },
          },
        },
      });

      const formattedActivity = recentActivity.map((log) => ({
        id: log.id,
        action: log.action,
        module: log.module,
        userId: log.userId,
        userName: log.user.fullName,
        createdAt: log.createdAt.toISOString(),
      }));

      return {
        stats: {
          totalUsers,
          activeUsers,
          inactiveUsers,
          totalRoles,
          recentLogins,
          pendingVerifications,
        },
        recentActivity: formattedActivity,
      };
    }, CACHE_TTL.DASHBOARD_STATS);

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error('Admin dashboard API error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}