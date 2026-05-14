import { NextRequest, NextResponse } from 'next/server';
import { resetPasswordService } from '@/services/auth';
import { resetPasswordSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validated = resetPasswordSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, message: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    // Get IP from headers
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                      request.headers.get('x-real-ip') || undefined;

    // Call reset password service
    const result = await resetPasswordService(validated.data, ipAddress);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error || 'Failed to reset password' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, message: result.message || 'Password has been reset successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password API error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}