import { NextResponse } from 'next/server';
import { logoutService } from '@/services/auth';

export async function POST() {
  try {
    const result = await logoutService();

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error || 'Logout failed' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}