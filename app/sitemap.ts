/**
 * SENIOR GOOGLE INFRASTRUCTURE & SEARCH ENGINE-GRADE SITEMAP GENERATOR
 * 
 * Target Endpoint: GET /sitemap.xml
 * Features:
 * 1. Resilient DB querying with a strict 3000ms timeout race condition guard (Prevents 504/500 cold start failures)
 * 2. Exact Mongoose query match for Product (Product schema has no isActive field)
 * 3. URL encoding via encodeURI to guarantee strict XML syntax compliance (prevents XML parsing errors on special characters/&/spaces)
 * 4. Normalization of BASE_URL (strips trailing slashes)
 * 5. ISO 8601 date formatting with safe fallbacks (prevents RangeError: Invalid time value)
 * 6. Deduplication of URLs via Map/Set
 */

import { MetadataRoute } from 'next';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import LandingPage from '@/models/LandingPage';

// Enable Incremental Static Regeneration (ISR) so Next.js caches sitemap.xml for 24 hours
export const revalidate = 86400;

// Base URL configuration (Normalized without trailing slash)
const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'https://assidrat.vercel.app').replace(/\/+$/, '');

/**
 * Product Categories Configuration
 */
const PRODUCT_CATEGORIES = [
  { slug: 'men', priority: 0.9, changefreq: 'weekly' as const },
  { slug: 'women', priority: 0.9, changefreq: 'weekly' as const },
  { slug: 'fusion', priority: 0.9, changefreq: 'weekly' as const },
  { slug: 'accessories', priority: 0.8, changefreq: 'weekly' as const },
];

/**
 * Static Pages Configuration
 */
const STATIC_PAGES = [
  { url: '', priority: 1.0, changefreq: 'daily' as const, lastModDaysAgo: 0 },
  { url: '/shop', priority: 0.95, changefreq: 'daily' as const, lastModDaysAgo: 1 },
  { url: '/community', priority: 0.7, changefreq: 'weekly' as const, lastModDaysAgo: 7 },
  { url: '/faq', priority: 0.6, changefreq: 'weekly' as const, lastModDaysAgo: 7 },
  { url: '/size-guide', priority: 0.6, changefreq: 'monthly' as const, lastModDaysAgo: 14 },
  { url: '/shipping-returns', priority: 0.5, changefreq: 'monthly' as const, lastModDaysAgo: 30 },
  { url: '/privacy-policy', priority: 0.4, changefreq: 'monthly' as const, lastModDaysAgo: 30 },
  { url: '/terms-of-service', priority: 0.4, changefreq: 'monthly' as const, lastModDaysAgo: 30 },
];

/**
 * Safely format ISO date string (YYYY-MM-DD)
 */
function safeIsoDate(input?: any, fallbackDaysAgo: number = 0): string {
  try {
    if (input) {
      const d = new Date(input);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
    }
  } catch (_) {
    // Fallback if parsing fails
  }
  const date = new Date();
  date.setDate(date.getDate() - fallbackDaysAgo);
  return date.toISOString().split('T')[0];
}

/**
 * Helper to wrap promises with a hard timeout limit
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      console.warn(`[Sitemap] DB query timed out after ${timeoutMs}ms. Using fallback.`);
      resolve(fallback);
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).then((result) => {
    clearTimeout(timer);
    return result;
  }).catch((err) => {
    clearTimeout(timer);
    console.error('[Sitemap] Query error:', err);
    return fallback;
  });
}

/**
 * Fetch active landing pages with 3s timeout
 */
async function fetchLandingPages(): Promise<Array<{ slug: string; lastmod: string }>> {
  const queryTask = (async () => {
    await dbConnect();
    const pages = await LandingPage.find(
      { isActive: true },
      { slug: 1, updatedAt: 1 },
      { lean: true }
    ).sort({ updatedAt: -1 });

    return pages.map((p: any) => ({
      slug: String(p.slug || '').trim(),
      lastmod: safeIsoDate(p.updatedAt, 1),
    })).filter(p => Boolean(p.slug));
  })();

  return withTimeout(queryTask, 3000, []);
}

/**
 * Fetch all products with 3s timeout
 * NOTE: Product schema has no isActive field, query all products directly
 */
async function fetchProducts(): Promise<Array<{ slug: string; lastmod: string }>> {
  const queryTask = (async () => {
    await dbConnect();
    const products = await Product.find(
      {},
      { slug: 1, updatedAt: 1 },
      { lean: true }
    ).sort({ updatedAt: -1 });

    return products.map((p: any) => ({
      slug: String(p.slug || '').trim(),
      lastmod: safeIsoDate(p.updatedAt, 1),
    })).filter(p => Boolean(p.slug));
  })();

  return withTimeout(queryTask, 3000, []);
}

/**
 * MAIN SITEMAP ENTRY POINT
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // Concurrent fetch with 3-second maximum duration
    const [products, landingPages] = await Promise.all([
      fetchProducts(),
      fetchLandingPages(),
    ]);

    const sitemapMap = new Map<string, MetadataRoute.Sitemap[number]>();

    // 1. Static Pages
    for (const page of STATIC_PAGES) {
      const fullUrl = `${BASE_URL}${page.url}`;
      sitemapMap.set(fullUrl, {
        url: encodeURI(fullUrl),
        lastModified: safeIsoDate(null, page.lastModDaysAgo),
        changeFrequency: page.changefreq,
        priority: page.priority,
      });
    }

    // 2. Category Pages
    for (const cat of PRODUCT_CATEGORIES) {
      const fullUrl = `${BASE_URL}/category/${cat.slug}`;
      sitemapMap.set(fullUrl, {
        url: encodeURI(fullUrl),
        lastModified: safeIsoDate(null, 7),
        changeFrequency: cat.changefreq,
        priority: cat.priority,
      });
    }

    // 3. Landing Pages
    for (const lp of landingPages) {
      const fullUrl = `${BASE_URL}/lp/${lp.slug}`;
      if (!sitemapMap.has(fullUrl)) {
        sitemapMap.set(fullUrl, {
          url: encodeURI(fullUrl),
          lastModified: lp.lastmod,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    }

    // 4. Product Pages
    for (const prod of products) {
      const fullUrl = `${BASE_URL}/product/${prod.slug}`;
      if (!sitemapMap.has(fullUrl)) {
        sitemapMap.set(fullUrl, {
          url: encodeURI(fullUrl),
          lastModified: prod.lastmod,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    }

    const result = Array.from(sitemapMap.values());
    result.sort((a, b) => a.url.localeCompare(b.url));

    return result;
  } catch (error) {
    console.error('[Sitemap] Critical error generating sitemap, returning static fallback:', error);
    
    // Fail-safe static response
    return STATIC_PAGES.map((page) => ({
      url: encodeURI(`${BASE_URL}${page.url}`),
      lastModified: safeIsoDate(null, page.lastModDaysAgo),
      changeFrequency: page.changefreq,
      priority: page.priority,
    }));
  }
}

