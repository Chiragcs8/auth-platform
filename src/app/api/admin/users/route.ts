import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.roleName !== 'Admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      include: { role: { select: { roleName: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const formattedUsers = users.map((user: { id: string; fullName: string; email: string; isVerified: boolean; isActive: boolean; createdAt: Date; lastLogin: Date | null; role: { roleName: string } }) => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      roleName: user.role.roleName,
      isVerified: user.isVerified,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.lastLogin?.toISOString() || null,
    }));

    return NextResponse.json({ success: true, users: formattedUsers });
  } catch (error) {
    console.error('Admin users API error:', error);
    return NextResponse.json({ success: false, message: 'An unexpected error occurred' }, { status: 500 });
  }
}