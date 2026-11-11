import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://sslcommerz.com https://*.sslcommerz.com https://connect.facebook.net https://*.facebook.net https://www.googletagmanager.com https://*.googletagmanager.com https://www.google-analytics.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https:;
    font-src 'self' data: https://fonts.gstatic.com;
    connect-src 'self' https://res.cloudinary.com https://*.sslcommerz.com https://www.facebook.com https://*.facebook.com https://connect.facebook.net https://*.facebook.net https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://stats.g.doubleclick.net https://*.doubleclick.net;
    frame-src 'self' https://*.sslcommerz.com https://www.facebook.com https://web.facebook.com https://www.googletagmanager.com https://*.doubleclick.net;
    object-src 'none';
    base-uri 'self';
    form-action 'self' https://*.sslcommerz.com https://www.facebook.com;
    frame-ancestors 'self';
    upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('loomra_token')?.value;
  const path = request.nextUrl.pathname;

  let response = NextResponse.next();

  // Profile authentication guard
  if (path.startsWith('/profile')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', path);
      response = NextResponse.redirect(loginUrl);
    } else {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_jwt_auth');
        await jwtVerify(token, secret);
      } catch (error) {
        response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('loomra_token');
      }
    }
  }

  // Inject High-Security Hardening Headers
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.png|apple-icon.png|sitemap.xml|robots.txt|images/).*)',
  ],
};
