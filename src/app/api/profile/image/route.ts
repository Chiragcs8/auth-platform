import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';
import { cookies } from 'next/headers';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    if (!accessToken) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const session = await verifyAccessToken(accessToken);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Invalid session' }, { status: 401 });
    }

    // Parse FormData
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No image file provided' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: 'File too large. Maximum size: 2MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer for Cloudinary upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const imageUrl = await uploadToCloudinary(buffer, session.userId, file.type);

    // Update or create profile with Cloudinary URL
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: session.userId },
    });

    if (existingProfile) {
      await prisma.profile.update({
        where: { userId: session.userId },
        data: { profileImage: imageUrl },
      });
    } else {
      await prisma.profile.create({
        data: {
          userId: session.userId,
          profileImage: imageUrl,
        },
      });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: 'PROFILE_IMAGE_UPDATED',
        module: 'profile',
      },
    });

    return NextResponse.json(
      { success: true, message: 'Profile image updated', data: { profileImage: imageUrl } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Profile image upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    if (!accessToken) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const session = await verifyAccessToken(accessToken);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Invalid session' }, { status: 401 });
    }

    // Delete image from Cloudinary
    await deleteFromCloudinary(session.userId);

    // Remove profile image URL from database
    await prisma.profile.updateMany({
      where: { userId: session.userId },
      data: { profileImage: null },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: 'PROFILE_IMAGE_REMOVED',
        module: 'profile',
      },
    });

    return NextResponse.json(
      { success: true, message: 'Profile image removed' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Profile image removal error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to remove image' },
      { status: 500 }
    );
  }
}