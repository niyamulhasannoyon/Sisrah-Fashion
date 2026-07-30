import { MetadataRoute } from 'next';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import LandingPage from '@/models/LandingPage';

// Enable Incremental Static Regeneration (ISR) so Next.js caches sitemap.xml
export const revalidate = 86400; // 24 hours

// Normalized base URL without trailing slash
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
 * Core Static Pages Configuration
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
 * Wrapper for database promises with hard timeout guard (Prevents 500/504 cold starts)
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      console.warn(`[Sitemap] DB query timed out after ${timeoutMs}ms. Returning fallback.`);
      resolve(fallback);
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise])
    .then((result) => {
      clearTimeout(timer);
      return result;
    })
    .catch((err) => {
      clearTimeout(timer);
      console.error('[Sitemap] Query error:', err);
      return fallback;
    });
}

/**
 * Fetch active landing pages with 3000ms timeout
 */
async function fetchLandingPages(): Promise<Array<{ slug: string; lastmod: string }>> {
  const queryTask = (async () => {
    await dbConnect();
    const pages = await LandingPage.find(
      { isActive: true },
      { slug: 1, updatedAt: 1 },
      { lean: true }
    ).sort({ updatedAt: -1 });

    return pages
      .map((p: any) => ({
        slug: String(p.slug || '').trim(),
        lastmod: safeIsoDate(p.updatedAt, 1),
      }))
      .filter((p) => Boolean(p.slug));
  })();

  return withTimeout(queryTask, 3000, []);
}

/**
 * Fetch all product slugs with 3000ms timeout
 */
async function fetchProducts(): Promise<Array<{ slug: string; lastmod: string }>> {
  const queryTask = (async () => {
    await dbConnect();
    const products = await Product.find(
      {},
      { slug: 1, updatedAt: 1 },
      { lean: true }
    ).sort({ updatedAt: -1 });

    return products
      .map((p: any) => ({
        slug: String(p.slug || '').trim(),
        lastmod: safeIsoDate(p.updatedAt, 1),
      }))
      .filter((p) => Boolean(p.slug));
  })();

  return withTimeout(queryTask, 3000, []);
}

/**
 * Main Dynamic XML Sitemap Entry Point (GET /sitemap.xml)
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [products, landingPages] = await Promise.all([
      fetchProducts(),
      fetchLandingPages(),
    ]);

    const sitemapMap = new Map<string, MetadataRoute.Sitemap[number]>();

    // 1. Static Pages
    for (const page of STATIC_PAGES) {
      const fullUrl = `${BASE_URL}${page.url}`;
      sitemapMap.set(fullUrl, {
        url: fullUrl,
        lastModified: safeIsoDate(null, page.lastModDaysAgo),
        changeFrequency: page.changefreq,
        priority: page.priority,
      });
    }

    // 2. Category Pages
    for (const cat of PRODUCT_CATEGORIES) {
      const fullUrl = `${BASE_URL}/category/${cat.slug}`;
      sitemapMap.set(fullUrl, {
        url: fullUrl,
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
          url: fullUrl,
          lastModified: lp.lastmod,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    }

    // 4. Dynamic Product Pages
    for (const prod of products) {
      const fullUrl = `${BASE_URL}/product/${prod.slug}`;
      if (!sitemapMap.has(fullUrl)) {
        sitemapMap.set(fullUrl, {
          url: fullUrl,
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
    console.error('[Sitemap] Error generating sitemap, executing fail-safe response:', error);
    return STATIC_PAGES.map((page) => ({
      url: `${BASE_URL}${page.url}`,
      lastModified: safeIsoDate(null, page.lastModDaysAgo),
      changeFrequency: page.changefreq,
      priority: page.priority,
    }));
  }
}
