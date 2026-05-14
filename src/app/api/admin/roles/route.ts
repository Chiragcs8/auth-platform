import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { serverCache, CACHE_TTL, roleListCacheKey } from '@/lib/cache';

export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.roleName !== 'Admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const formattedRoles = await serverCache.getOrSet(roleListCacheKey(), async () => {
      const roles = await prisma.role.findMany({
        include: {
          _count: {
            select: { users: true },
          },
        },
        orderBy: { roleName: 'asc' },
      });

      return roles.map((role: { id: string; roleName: string; createdAt: Date; _count: { users: number } }) => ({
        id: role.id,
        roleName: role.roleName,
        userCount: role._count.users,
        createdAt: role.createdAt.toISOString(),
      }));
    }, CACHE_TTL.ROLE_LIST);

    return NextResponse.json({
      success: true,
      roles: formattedRoles,
    });
  } catch (error) {
    console.error('Admin roles API error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}