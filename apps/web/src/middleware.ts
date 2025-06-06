import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  console.log('🔵 MIDDLEWARE HIT:', req.nextUrl.pathname);

  // Log all cookies for debugging
  const allCookies = req.cookies.getAll();
  console.log(
    '🍪 All cookies:',
    allCookies.map((c) => `${c.name}=${c.value.substring(0, 20)}...`)
  );

  // Look for any Supabase-related cookies
  const supabaseCookies = allCookies.filter(
    (cookie) =>
      cookie.name.includes('supabase') ||
      cookie.name.includes('sb-') ||
      cookie.name.startsWith('auth-') ||
      cookie.value.includes('access_token') ||
      cookie.value.includes('refresh_token')
  );

  console.log(
    '🔑 Supabase-related cookies:',
    supabaseCookies.map((c) => c.name)
  );

  const hasAuthCookies = supabaseCookies.length > 0;

  // Auth routes (login, register) should redirect to dashboard if user is already logged in
  if (
    hasAuthCookies &&
    (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register')
  ) {
    console.log('🔄 Redirecting authenticated user to dashboard');
    const redirectUrl = new URL('/dashboard', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Protected routes should redirect to login if user is not logged in
  if (!hasAuthCookies && req.nextUrl.pathname.startsWith('/dashboard')) {
    console.log('🚫 Redirecting unauthenticated user to login');
    const redirectUrl = new URL('/login', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  console.log('✅ Middleware allowing request to continue');
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
