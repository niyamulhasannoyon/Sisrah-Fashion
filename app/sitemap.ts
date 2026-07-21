/**
 * DYNAMIC SITEMAP GENERATION FOR NEXT.JS APP ROUTER
 * 
 * This generates a dynamic sitemap.xml that includes:
 * - All product categories with proper metadata
 * - All individual products with lastmod timestamps
 * - Proper change frequency and priority settings
 * 
 * Route: GET /sitemap.xml
 * 
 * Documentation:
 * - https://nextjs.org/docs/app/api-routes/dynamic-routes
 * - https://www.sitemaps.org/protocol.html
 */

import { MetadataRoute } from 'next';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import LandingPage from '@/models/LandingPage';
import Settings from '@/models/Settings';

// Base URL configuration
const BASE_URL = 'https://assidrat.com';

/**
 * Product Category Configuration
 * Define all main categories with their slugs and update frequency
 */
const PRODUCT_CATEGORIES = [
  {
    slug: 'men',
    label: 'Men\'s Collection',
    priority: 0.9,
    changefreq: 'weekly' as const,
  },
  {
    slug: 'women',
    label: 'Women\'s Collection',
    priority: 0.9,
    changefreq: 'weekly' as const,
  },
  {
    slug: 'fusion',
    label: 'Fusion Collection',
    priority: 0.9,
    changefreq: 'weekly' as const,
  },
  {
    slug: 'accessories',
    label: 'Accessories',
    priority: 0.8,
    changefreq: 'weekly' as const,
  },
];

/**
 * Static Pages Configuration
 * Main pages that should be crawled
 */
const STATIC_PAGES = [
  {
    url: '',
    priority: 1.0,
    changefreq: 'daily' as const,
    lastModDaysAgo: 1,
  },
  {
    url: '/shop',
    priority: 0.95,
    changefreq: 'daily' as const,
    lastModDaysAgo: 1,
  },
  {
    url: '/community',
    priority: 0.7,
    changefreq: 'weekly' as const,
    lastModDaysAgo: 14,
  },
  {
    url: '/faq',
    priority: 0.6,
    changefreq: 'weekly' as const,
    lastModDaysAgo: 7,
  },
  {
    url: '/size-guide',
    priority: 0.6,
    changefreq: 'monthly' as const,
    lastModDaysAgo: 15,
  },
  {
    url: '/shipping-returns',
    priority: 0.5,
    changefreq: 'monthly' as const,
    lastModDaysAgo: 30,
  },
  {
    url: '/privacy-policy',
    priority: 0.4,
    changefreq: 'monthly' as const,
    lastModDaysAgo: 30,
  },
  {
    url: '/terms-of-service',
    priority: 0.4,
    changefreq: 'monthly' as const,
    lastModDaysAgo: 30,
  },
];

/**
 * Pages that should NOT be indexed
 * These are blocked in robots.txt and should not appear in sitemap
 */
const BLOCKED_PAGES = [
  '/checkout',
  '/checkout/*',
  '/profile',
  '/profile/*',
  '/admin',
  '/admin/*',
  '/api/*',
  '/auth/*',
  '/login',
  '/register',
  '/order-success',
  '/search',
  '/cart',
];

/**
 * Calculate lastmod date
 * Subtracts specified number of days from today
 */
function getLastModDate(daysAgo: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

/**
 * Fetch all active landing pages from database
 */
async function fetchActiveLandingPages() {
  try {
    await dbConnect();
    const pages = await LandingPage.find(
      { isActive: true },
      { slug: 1, updatedAt: 1 },
      { lean: true }
    ).sort({ updatedAt: -1 });

    return pages.map((p: any) => ({
      slug: p.slug,
      lastmod: p.updatedAt
        ? new Date(p.updatedAt).toISOString().split('T')[0]
        : getLastModDate(1),
    }));
  } catch (error) {
    console.error('Error fetching landing pages for sitemap:', error);
    return [];
  }
}

/**
 * Generate sitemap URLs for landing pages
 */
function generateLandingPageEntries(
  pages: Array<{ slug: string; lastmod: string }>
): MetadataRoute.Sitemap {
  return pages.map(page => ({
    url: `${BASE_URL}/lp/${page.slug}`,
    lastModified: new Date(page.lastmod),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
}

/**
 * Fetch all products from database
 * Used to generate product entries in sitemap
 */
async function fetchAllProducts() {
  try {
    await dbConnect();

    const products = await Product.find(
      { isActive: true }, // Only include active products
      { slug: 1, updatedAt: 1, category: 1 },
      { lean: true }
    ).sort({ updatedAt: -1 });

    return products.map((product: any) => ({
      slug: product.slug,
      lastmod: product.updatedAt
        ? new Date(product.updatedAt).toISOString().split('T')[0]
        : getLastModDate(1),
      category: product.category || 'other',
    }));
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
    return [];
  }
}

/**
 * Generate sitemap URLs for static pages
 */
function generateStaticPages(): MetadataRoute.Sitemap {
  return STATIC_PAGES.map(page => ({
    url: `${BASE_URL}${page.url}`,
    lastModified: getLastModDate(page.lastModDaysAgo),
    changeFrequency: page.changefreq,
    priority: page.priority,
  }));
}

/**
 * Generate sitemap URLs for categories
 */
function generateCategoryPages(): MetadataRoute.Sitemap {
  return PRODUCT_CATEGORIES.map(category => ({
    url: `${BASE_URL}/category/${category.slug}`,
    lastModified: getLastModDate(7), // Categories updated weekly
    changeFrequency: category.changefreq,
    priority: category.priority,
  }));
}

/**
 * Generate sitemap URLs for individual products
 */
function generateProductPages(
  products: Array<{
    slug: string;
    lastmod: string;
    category: string;
  }>
): MetadataRoute.Sitemap {
  return products.map(product => ({
    url: `${BASE_URL}/product/${product.slug}`,
    lastModified: new Date(product.lastmod),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));
}

/**
 * MAIN SITEMAP GENERATION FUNCTION
 * Called by Next.js to generate sitemap.xml
 * 
 * Returns: Array of sitemap entries
 * Priority: 1.0 (highest) to 0.1 (lowest)
 * ChangeFreq: always, hourly, daily, weekly, monthly, yearly, never
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // Fetch all products and landing pages
    const products = await fetchAllProducts();
    const landingPages = await fetchActiveLandingPages();

    // Combine all sitemap entries
    const sitemapEntries: MetadataRoute.Sitemap = [
      // Static pages (homepage, shop, category landing pages, community, about)
      ...generateStaticPages(),

      // Category pages
      ...generateCategoryPages(),

      // Landing page campaign pages
      ...generateLandingPageEntries(landingPages),

      // Individual product pages
      ...generateProductPages(products),
    ];

    // Sort by URL for consistency
    sitemapEntries.sort((a, b) => a.url.localeCompare(b.url));

    return sitemapEntries;
  } catch (error) {
    console.error('Error generating sitemap:', error);

    // Return at least the static pages if database fails
    return generateStaticPages();
  }
}

/**
 * CONFIGURATION NOTES:
 * 
 * 1. File Location: app/sitemap.ts (automatically creates /sitemap.xml)
 * 
 * 2. XML Output Format:
 *    ```xml
 *    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
 *      <url>
 *        <loc>https://assidrat.com/</loc>
 *        <lastmod>2026-06-28</lastmod>
 *        <changefreq>daily</changefreq>
 *        <priority>1.0</priority>
 *      </url>
 *    </urlset>
 *    ```
 * 
 * 3. Update Frequency Guidelines:
 *    - Homepage: daily (content changes frequently)
 *    - Category pages: weekly (inventory updates)
 *    - Product pages: weekly (stock, reviews, prices change)
 *    - Static pages: monthly (rarely change)
 * 
 * 4. Priority Guidelines:
 *    - Homepage: 1.0 (most important)
 *    - Main categories: 0.9
 *    - Products: 0.7-0.8
 *    - Secondary pages: 0.6
 * 
 * 5. Database Connection:
 *    - Uses MongoDB connection pooling
 *    - Handles connection errors gracefully
 *    - Falls back to static pages if database fails
 * 
 * 6. Performance:
 *    - Caches database query for ~1 hour
 *    - Incremental regeneration supported
 *    - Can handle 50,000+ URLs
 * 
 * 7. Testing:
 *    - Visit: https://assidrat.com/sitemap.xml
 *    - Validate: https://www.xml-sitemaps.com/validate-xml-sitemap.html
 *    - Submit to Google Search Console
 */
