import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.roleName !== 'Client') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get client's activity count for stats context
    const clientActivityCount = await prisma.activityLog.count({
      where: { userId: session.userId },
    });

    const recentLogins = await prisma.activityLog.count({
      where: {
        userId: session.userId,
        action: 'LOGIN_SUCCESS',
      },
    });

    // Client stats - derived from available data with domain placeholders
    // In a full implementation, these would query Order, Wishlist, ProductView tables
    const stats = {
      totalOrders: 0,
      activeOrders: 0,
      wishlistItems: 0,
      recentViews: recentLogins,
    };

    // Recent activity for the client
    const recentActivity = await prisma.activityLog.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const formattedActivity = recentActivity.map((log: { id: string; action: string; module: string; createdAt: Date }) => ({
      id: log.id,
      action: log.action,
      module: log.module,
      createdAt: log.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      stats,
      recentActivity: formattedActivity,
    });
  } catch (error) {
    console.error('Client dashboard API error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}