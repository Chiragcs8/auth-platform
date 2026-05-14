import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.roleName !== 'Broker') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get broker-relevant stats from available data
    const totalClients = await prisma.user.count({
      where: {
        role: { roleName: 'Client' },
      },
    });

    const activeClients = await prisma.user.count({
      where: {
        role: { roleName: 'Client' },
        isActive: true,
      },
    });

    const totalUsers = await prisma.user.count();

    // Broker stats - derived from platform data with domain placeholders
    // In a full implementation, these would query Deal, Commission, Relationship tables
    const stats = {
      totalClients,
      activeRelationships: activeClients,
      totalCommission: 0,
      pendingDeals: 0,
      completedDeals: 0,
      avgDealValue: 0,
    };

    // Recent "deals" - placeholder from recent client activity
    const recentClientActivity = await prisma.activityLog.findMany({
      where: {
        action: { in: ['REGISTER', 'LOGIN_SUCCESS', 'PROFILE_UPDATE'] },
        user: { role: { roleName: 'Client' } },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: {
        user: {
          select: { fullName: true },
        },
      },
    });

    const recentDeals = recentClientActivity.map((log: { id: string; user: { fullName: string }; action: string; createdAt: Date }) => ({
      id: log.id,
      clientName: log.user.fullName,
      amount: 0,
      status: log.action === 'REGISTER' ? 'pending' : log.action === 'LOGIN_SUCCESS' ? 'active' : 'completed',
      createdAt: log.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      stats,
      recentDeals,
    });
  } catch (error) {
    console.error('Broker dashboard API error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}