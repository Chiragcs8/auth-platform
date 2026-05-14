import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { serverCache, CACHE_TTL, userListCacheKey, dashboardCacheKey } from '@/lib/cache';

export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.roleName !== 'Admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const formattedUsers = await serverCache.getOrSet(userListCacheKey(), async () => {
      const users = await prisma.user.findMany({
        include: { role: { select: { roleName: true } } },
        orderBy: { createdAt: 'desc' },
      });

      return users.map((user: { id: string; fullName: string; email: string; isVerified: boolean; isActive: boolean; createdAt: Date; lastLogin: Date | null; role: { roleName: string } }) => ({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        roleName: user.role.roleName,
        isVerified: user.isVerified,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
        lastLogin: user.lastLogin?.toISOString() || null,
      }));
    }, CACHE_TTL.USER_LIST);

    return NextResponse.json({ success: true, users: formattedUsers });
  } catch (error) {
    console.error('Admin users API error:', error);
    return NextResponse.json({ success: false, message: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.roleName !== 'Admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, isActive } = body;

    if (!userId || typeof isActive !== 'boolean') {
      return NextResponse.json({ success: false, message: 'userId and isActive (boolean) are required' }, { status: 400 });
    }

    // Prevent admin from deactivating themselves
    if (userId === session.userId && !isActive) {
      return NextResponse.json({ success: false, message: 'You cannot deactivate your own account' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
      include: { role: { select: { roleName: true } } },
    });

    // Invalidate user list cache so the next GET reflects the change
    serverCache.invalidate(userListCacheKey());
    // Invalidate dashboard stats cache so active/inactive counts update
    serverCache.invalidate(dashboardCacheKey('admin'));

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        roleName: updatedUser.role.roleName,
        isVerified: updatedUser.isVerified,
        isActive: updatedUser.isActive,
        createdAt: updatedUser.createdAt.toISOString(),
        lastLogin: updatedUser.lastLogin?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error('Admin user toggle API error:', error);
    return NextResponse.json({ success: false, message: 'An unexpected error occurred' }, { status: 500 });
  }
}