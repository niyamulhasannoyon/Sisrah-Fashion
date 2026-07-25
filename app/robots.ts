import { MetadataRoute } from 'next';

// Cache robots.txt output for 24 hours
export const revalidate = 86400;

export default function robots(): MetadataRoute.Robots {
  const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'https://assidrat.vercel.app').replace(/\/+$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/shop',
          '/category/',
          '/product/',
          '/lp/',
          '/community',
          '/_next/static/',
          '/images/',
          '/sitemap.xml',
          '/llms.txt',
          '/llms-full.txt',
        ],
        disallow: [
          '/checkout',
          '/checkout/*',
          '/profile',
          '/profile/*',
          '/account',
          '/account/*',
          '/my-orders',
          '/login',
          '/register',
          '/auth/',
          '/logout',
          '/admin',
          '/admin/*',
          '/dashboard',
          '/analytics',
          '/coupons',
          '/settings',
          '/orders',
          '/staff',
          '/users',
          '/customers',
          '/api/',
          '/search',
          '/cart',
        ],
      },
      {
        userAgent: ['Googlebot', 'Google-Extended', 'GoogleOther'],
        allow: [
          '/',
          '/shop',
          '/category/',
          '/product/',
          '/lp/',
          '/community',
          '/sitemap.xml',
        ],
        disallow: [
          '/checkout',
          '/profile',
          '/admin',
          '/cart',
          '/api/',
          '/search',
        ],
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'ClaudeBot', 'anthropic-ai', 'PerplexityBot', 'cohere-ai'],
        allow: ['/', '/llms.txt', '/llms-full.txt', '/shop', '/category/', '/product/', '/lp/', '/community'],
        disallow: ['/checkout', '/profile', '/admin', '/cart', '/api/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}

