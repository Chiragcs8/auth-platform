import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const module = searchParams.get('module') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    // Build where clause - only user's own activity logs
    const where: Record<string, unknown> = {
      userId: session.userId,
    };

    if (module) {
      where.module = module;
    }

    if (search) {
      where.action = { contains: search, mode: 'insensitive' };
    }

    const logs = await prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await prisma.activityLog.count({ where });

    const formattedLogs = logs.map((log: { id: string; action: string; module: string; ipAddress: string | null; createdAt: Date }) => ({
      id: log.id,
      action: log.action,
      module: log.module,
      ipAddress: log.ipAddress,
      createdAt: log.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      logs: formattedLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Activity API error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}