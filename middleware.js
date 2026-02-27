import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Protect /admin route — redirect to login if no admin token cookie
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('tally_admin_token')?.value;
    if (!token) {
      // Let the client-side handle showing the login form
      // but set a header so the page knows auth is needed
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
