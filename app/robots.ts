import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const BASE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    'https://assidrat.com';

  return {
    rules: {
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
      ],
      disallow: [
        '/checkout',
        '/checkout/',
        '/profile',
        '/profile/',
        '/account',
        '/account/',
        '/my-orders',
        '/my-orders/',
        '/login',
        '/register',
        '/auth/',
        '/logout',
        '/admin',
        '/admin/',
        '/dashboard',
        '/dashboard/',
        '/api/',
        '/api/*',
        '/search',
        '/search/',
        '/query',
        '/?search=',
        '/*?search=',
        '/track-order',
        '/order/',
        '/order-success',
        '/cart',
        '/cart/',
        '/*?review=',
        '/*&review=',
        '/*?filter=',
        '/*&filter=',
        '/*?sort=',
        '/*&sort=',
        '/*?page=',
        '/*&page=',
        '/print',
        '/*?print=',
        '/export',
        '/*?export=',
        '/settings',
        '/coupons',
        '/analytics',
        '/customers',
        '/preview/',
        '/draft/',
        '/archive/',
        '/*?sessionid=',
        '/*&sessionid=',
        '/*?utm_source=',
        '/*&utm_source=',
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
