import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  // Get the session directly from the auth library
  const session = await auth.api.getSession({ headers: request.headers });
  
  // Check if user is authenticated
  if (!session?.user?.id) {
    // If not authenticated, return error
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  
  // If authenticated, redirect to dashboard
  return NextResponse.redirect(new URL('/dashboard', request.url));
} 