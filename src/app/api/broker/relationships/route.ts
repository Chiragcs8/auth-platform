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

    // Get client users with their profiles for relationship data
    const clients = await prisma.user.findMany({
      where: {
        role: { roleName: 'Client' },
      },
      include: {
        profile: {
          select: {
            phone: true,
            companyName: true,
          },
        },
        role: {
          select: { roleName: true },
        },
      },
      take: 50,
    });

    // Get activity counts per client for deal context
    const relationships = clients.map((client: { id: string; fullName: string; email: string; isActive: boolean; createdAt: Date; profile: { phone: string | null; companyName: string | null } | null }) => ({
      id: client.id,
      clientName: client.fullName,
      clientEmail: client.email,
      clientPhone: client.profile?.phone || null,
      companyName: client.profile?.companyName || null,
      status: client.isActive ? 'active' : 'inactive',
      dealCount: 0,
      totalValue: 0,
      rating: 0,
    }));

    return NextResponse.json({
      success: true,
      relationships,
    });
  } catch (error) {
    console.error('Broker relationships API error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}