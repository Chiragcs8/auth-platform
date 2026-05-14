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

    if (!search) {
      return NextResponse.json({
        success: true,
        users: [],
      });
    }

    // Search users by name, email, or ID
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { id: { contains: search } },
        ],
      },
      include: {
        role: {
          select: { roleName: true },
        },
        profile: {
          select: { phone: true },
        },
      },
      take: 20,
    });

    const formattedUsers = users.map((user: { id: string; fullName: string; email: string; isVerified: boolean; isActive: boolean; lastLogin: Date | null; createdAt: Date; role: { roleName: string }; profile: { phone: string | null } | null }) => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      roleName: user.role.roleName,
      isVerified: user.isVerified,
      isActive: user.isActive,
      lastLogin: user.lastLogin?.toISOString() || null,
      createdAt: user.createdAt.toISOString(),
      phone: user.profile?.phone || null,
    }));

    return NextResponse.json({
      success: true,
      users: formattedUsers,
    });
  } catch (error) {
    console.error('Support user-lookup API error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}