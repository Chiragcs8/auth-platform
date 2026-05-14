import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { profileUpdateSchema } from '@/lib/validations';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        role: true,
        profile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        roleName: user.role.roleName,
        isVerified: user.isVerified,
        isActive: user.isActive,
        lastLogin: user.lastLogin?.toISOString(),
        createdAt: user.createdAt.toISOString(),
        profileData: user.profile ? {
          id: user.profile.id,
          profileImage: user.profile.profileImage,
          phone: user.profile.phone,
          address: user.profile.address,
          city: user.profile.city,
          state: user.profile.state,
          country: user.profile.country,
          zipCode: user.profile.zipCode,
          bio: user.profile.bio,
          companyName: user.profile.companyName,
          website: user.profile.website,
          department: user.profile.department,
          brokerage: user.profile.brokerage,
        } : null,
      },
    });
  } catch (error) {
    console.error('Profile GET API error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = profileUpdateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: validated.error.issues },
        { status: 400 }
      );
    }

    const data = validated.data;

    // Update user name
    await prisma.user.update({
      where: { id: session.userId },
      data: { fullName: data.fullName },
    });

    // Update or create profile
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: session.userId },
    });

    if (existingProfile) {
      await prisma.profile.update({
        where: { userId: session.userId },
        data: {
          phone: data.phone || null,
          address: data.address || null,
          city: data.city || null,
          state: data.state || null,
          country: data.country || null,
          zipCode: data.zipCode || null,
          bio: data.bio || null,
          companyName: data.companyName || null,
          website: data.website || null,
          department: data.department || null,
          brokerage: data.brokerage || null,
        },
      });
    } else {
      await prisma.profile.create({
        data: {
          userId: session.userId,
          phone: data.phone || null,
          address: data.address || null,
          city: data.city || null,
          state: data.state || null,
          country: data.country || null,
          zipCode: data.zipCode || null,
          bio: data.bio || null,
          companyName: data.companyName || null,
          website: data.website || null,
          department: data.department || null,
          brokerage: data.brokerage || null,
        },
      });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: 'PROFILE_UPDATE',
        module: 'profile',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Profile PUT API error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}