import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('loomra_token')?.value;
  const path = request.nextUrl.pathname;

  // Prevent authenticated users from visiting login or register
  if (path === '/login' || path === '/register') {
    if (token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        await jwtVerify(token, secret);
        return NextResponse.redirect(new URL('/', request.url));
      } catch (error) {
        // Token is invalid, delete cookie and let them view the page
        const response = NextResponse.next();
        response.cookies.delete('loomra_token');
        return response;
      }
    }
  }

  if (path.startsWith('/profile')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch (error) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('loomra_token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/login', '/register'],
};