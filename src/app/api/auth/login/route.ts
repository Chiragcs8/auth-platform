import { NextRequest, NextResponse } from 'next/server';
import { loginService } from '@/services/auth';
import { loginSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validated = loginSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, message: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    // Get IP and user agent from headers
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                      request.headers.get('x-real-ip') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;

    // Call login service
    const result = await loginService(validated.data, ipAddress, userAgent);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error || 'Login failed' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        data: {
          dashboardPath: result.data?.redirectUrl || '/client/dashboard',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}