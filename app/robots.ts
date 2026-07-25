import { MetadataRoute } from 'next';

// Cache robots.txt output for 24h
export const revalidate = 86400;

export default function robots(): MetadataRoute.Robots {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://assidrat.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/shop',
          '/category/',
          '/product/',
          '/community',
          '/_next/static/',
          '/images/',
          '/public/',
          '/sitemap.xml',
          '/llms.txt',
          '/llms-full.txt',
        ],
        disallow: [
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
          '/api/',
          '/search',
          '/cart',
        ],
      },
      {
        userAgent: ['Googlebot', 'Google-Extended', 'GoogleOther'],
        allow: '/',
        disallow: ['/checkout', '/profile', '/admin', '/cart', '/api/'],
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'ClaudeBot', 'anthropic-ai', 'PerplexityBot', 'cohere-ai'],
        allow: ['/', '/llms.txt', '/llms-full.txt', '/shop', '/category/', '/product/', '/community'],
        disallow: ['/checkout', '/profile', '/admin', '/cart', '/api/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
