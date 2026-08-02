import { MetadataRoute } from 'next';

// Cache robots.txt output for 24 hours
export const revalidate = 86400;

export default function robots(): MetadataRoute.Robots {
  const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'https://assidrat.vercel.app').replace(/\/+$/, '');

  const commonDisallows = [
    '/api/',
    '/checkout',
    '/profile',
    '/account',
    '/my-orders',
    '/login',
    '/register',
    '/auth/',
    '/logout',
    '/admin',
    '/dashboard',
    '/analytics',
    '/coupons',
    '/settings',
    '/orders',
    '/staff',
    '/users',
    '/customers',
    '/search',
    '/cart',
  ];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: commonDisallows,
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: commonDisallows,
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: commonDisallows,
      },
      {
        userAgent: 'GPTBot',
        allow: ['/', '/llms.txt', '/llms-full.txt'],
        disallow: commonDisallows,
      },
      {
        userAgent: 'ClaudeBot',
        allow: ['/', '/llms.txt', '/llms-full.txt'],
        disallow: commonDisallows,
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
