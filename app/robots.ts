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
          '/api/',
          '/api/*',
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
          '/search',
          '/cart',
        ],
      },
      {
        userAgent: ['Googlebot', 'Google-Extended', 'GoogleOther', 'Bingbot'],
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
          '/api/',
          '/api/*',
          '/checkout',
          '/profile',
          '/admin',
          '/cart',
          '/search',
        ],
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'ClaudeBot', 'anthropic-ai', 'PerplexityBot', 'cohere-ai'],
        allow: ['/', '/llms.txt', '/llms-full.txt', '/shop', '/category/', '/product/', '/lp/', '/community'],
        disallow: ['/api/', '/api/*', '/checkout', '/profile', '/admin', '/cart'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
