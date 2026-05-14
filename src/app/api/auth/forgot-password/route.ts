import { NextRequest, NextResponse } from 'next/server';
import { forgotPasswordService } from '@/services/auth';
import { forgotPasswordSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validated = forgotPasswordSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, message: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    // Get IP from headers
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                      request.headers.get('x-real-ip') || undefined;

    // Call forgot password service — returns token on success
    const result = await forgotPasswordService(validated.data, ipAddress);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error || 'Password verification failed' },
        { status: 400 }
      );
    }

    // Return the reset token so the client can redirect to /reset-password?token=...
    return NextResponse.json(
      {
        success: true,
        message: result.message || 'Current password verified. You can now reset your password.',
        token: result.data?.token,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password API error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}