import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.roleName !== 'Vendor') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get vendor-specific stats from available data
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({ where: { isActive: true } });

    // Get vendor's activity for views/orders context
    const vendorActivity = await prisma.activityLog.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const recentLogins = vendorActivity.filter(
      (log: { action: string }) => log.action === 'LOGIN_SUCCESS'
    ).length;

    // Vendor stats - derived from platform data with domain placeholders
    // In a full implementation, these would query Product, Order, Listing tables
    const stats = {
      totalProducts: 0,
      activeListings: 0,
      totalOrders: 0,
      revenue: 0,
      pendingOrders: 0,
      viewsThisWeek: recentLogins,
    };

    // Recent "orders" - placeholder from recent activity logs
    const recentActivityLogs = await prisma.activityLog.findMany({
      where: {
        action: { in: ['LOGIN_SUCCESS', 'PROFILE_UPDATE', 'PASSWORD_CHANGE'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        user: {
          select: { fullName: true },
        },
      },
    });

    const recentOrders = recentActivityLogs.map((log: { id: string; user: { fullName: string }; action: string; createdAt: Date }) => ({
      id: log.id,
      customerName: log.user.fullName,
      amount: 0,
      status: log.action === 'LOGIN_SUCCESS' ? 'completed' : 'pending',
      createdAt: log.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      stats,
      recentOrders,
    });
  } catch (error) {
    console.error('Vendor dashboard API error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}