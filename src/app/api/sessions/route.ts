import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const sessions = await prisma.session.findMany({
      where: {
        userId: session.userId,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedSessions = sessions.map((s: { id: string; ipAddress: string | null; userAgent: string | null; expiresAt: Date; createdAt: Date }) => ({
      id: s.id,
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
      expiresAt: s.expiresAt.toISOString(),
      createdAt: s.createdAt.toISOString(),
      isCurrent: s.id === session.sessionId,
    }));

    return NextResponse.json({
      success: true,
      sessions: formattedSessions,
    });
  } catch (error) {
    console.error('Sessions GET API error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Don't allow deleting current session
    if (sessionId === session.sessionId) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete your current session. Use logout instead.' },
        { status: 400 }
      );
    }

    // Verify the session belongs to the user
    const targetSession = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!targetSession || targetSession.userId !== session.userId) {
      return NextResponse.json(
        { success: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    await prisma.session.delete({
      where: { id: sessionId },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: 'SESSION_REVOKED',
        module: 'session',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Session revoked successfully',
    });
  } catch (error) {
    console.error('Sessions DELETE API error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}