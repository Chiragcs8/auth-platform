import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { serverCache, CACHE_TTL, activityLogsCacheKey } from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.roleName !== 'Admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const moduleFilter = searchParams.get('module');
    const searchQuery = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build a cache key that includes query params for pagination/filtering
    const cacheKey = `${activityLogsCacheKey()}:${moduleFilter || 'all'}:${searchQuery || ''}:${page}:${limit}`;

    const data = await serverCache.getOrSet(cacheKey, async () => {
      const where: Record<string, unknown> = {};

      if (moduleFilter && moduleFilter !== 'all') {
        where.module = moduleFilter;
      }

      if (searchQuery) {
        where.OR = [
          { action: { contains: searchQuery, mode: 'insensitive' } },
          { user: { fullName: { contains: searchQuery, mode: 'insensitive' } } },
          { user: { email: { contains: searchQuery, mode: 'insensitive' } } },
          { ipAddress: { contains: searchQuery } },
        ];
      }

      const logs = await prisma.activityLog.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { fullName: true, email: true },
          },
        },
      });

      const total = await prisma.activityLog.count({ where });

      const formattedLogs = logs.map((log: { id: string; action: string; module: string; userId: string; ipAddress: string | null; createdAt: Date; user: { fullName: string; email: string } }) => ({
        id: log.id,
        action: log.action,
        module: log.module,
        userId: log.userId,
        userName: log.user.fullName,
        userEmail: log.user.email,
        ipAddress: log.ipAddress,
        createdAt: log.createdAt.toISOString(),
      }));

      return { logs: formattedLogs, total };
    }, CACHE_TTL.ACTIVITY_LOGS);

    return NextResponse.json({
      success: true,
      ...data,
      page,
      limit,
    });
  } catch (error) {
    console.error('Admin activity-logs API error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}