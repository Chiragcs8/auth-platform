import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailService } from '@/services/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Get IP from headers
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                      request.headers.get('x-real-ip') || undefined;

    // Call verify email service
    const result = await verifyEmailService(token, ipAddress);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error || 'Email verification failed' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, message: result.message || 'Email verified successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify email API error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}