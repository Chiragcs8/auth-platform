import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.roleName !== 'Support Staff') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    // Build where clause for support-relevant activity
    const where: Record<string, unknown> = {
      action: { in: ['LOGIN_FAILED', 'PASSWORD_RESET', 'REGISTER', 'EMAIL_VERIFIED', 'PROFILE_UPDATE'] },
    };

    if (status) {
      // Map status filter to action types
      const actionMap: Record<string, string[]> = {
        open: ['LOGIN_FAILED', 'REGISTER'],
        in_progress: ['PASSWORD_RESET'],
        resolved: ['EMAIL_VERIFIED'],
        closed: ['PROFILE_UPDATE'],
      };
      if (actionMap[status]) {
        where.action = { in: actionMap[status] };
      }
    }

    if (search) {
      where.action = { contains: search, mode: 'insensitive' };
    }

    const activityLogs = await prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        user: {
          select: { fullName: true, email: true },
        },
      },
    });

    const total = await prisma.activityLog.count({ where });

    // Map activity logs to ticket-like format
    const tickets = activityLogs.map((log: { id: string; action: string; module: string; user: { fullName: string; email: string }; createdAt: Date; updatedAt?: Date }) => {
      let ticketStatus = 'open';
      let priority = 'medium';

      if (log.action === 'EMAIL_VERIFIED') {
        ticketStatus = 'resolved';
        priority = 'low';
      } else if (log.action === 'LOGIN_FAILED') {
        ticketStatus = 'open';
        priority = 'high';
      } else if (log.action === 'PASSWORD_RESET') {
        ticketStatus = 'in_progress';
        priority = 'medium';
      } else if (log.action === 'REGISTER') {
        ticketStatus = 'open';
        priority = 'low';
      } else if (log.action === 'PROFILE_UPDATE') {
        ticketStatus = 'closed';
        priority = 'low';
      }

      return {
        id: log.id,
        subject: `${log.action} request from ${log.user.fullName}`,
        description: `User ${log.user.email} triggered ${log.action} in ${log.module} module`,
        status: ticketStatus,
        priority,
        assignee: null,
        createdAt: log.createdAt.toISOString(),
        updatedAt: log.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Support tickets API error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}