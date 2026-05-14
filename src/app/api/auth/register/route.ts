import { NextRequest, NextResponse } from 'next/server';
import { registerService } from '@/services/auth';
import { registerSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validated = registerSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, message: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    // Get IP from headers
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                      request.headers.get('x-real-ip') || undefined;

    // Call register service
    const result = await registerService(validated.data, ipAddress);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error || 'Registration failed' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful',
        data: {
          dashboardPath: result.data?.redirectUrl || '/client/dashboard',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register API error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}