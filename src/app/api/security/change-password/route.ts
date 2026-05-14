import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { changePasswordSchema } from '@/lib/validations';
import bcrypt from 'bcryptjs';

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
    const validated = changePasswordSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: validated.error.issues },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validated.data;

    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: session.userId },
      data: { passwordHash: newPasswordHash },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: 'PASSWORD_CHANGE',
        module: 'security',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password API error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}