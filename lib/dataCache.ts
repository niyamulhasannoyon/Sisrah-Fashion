import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import dbConnect from '@/lib/dbConnect';
import Settings from '@/models/Settings';
import LandingPage from '@/models/LandingPage';
import Product from '@/models/Product';
import Review from '@/models/Review';
import type { SiteSettings, ProductItem } from '@/types';

/**
 * 1. Cached Site Settings
 * React cache() dedupes multiple calls in the same server render pass (e.g. RootLayout + Page).
 * unstable_cache() caches the parsed result across requests with tag-based invalidation.
 */
export const getCachedSettings = cache(async (): Promise<SiteSettings | null> => {
  return unstable_cache(
    async () => {
      try {
        await dbConnect();
        let settings = await Settings.findOne().lean();
        if (!settings) {
          const doc = new Settings({});
          await doc.save();
          settings = doc.toObject();
        }
        return JSON.parse(JSON.stringify(settings));
      } catch (error) {
        console.error('[dataCache] Error fetching settings:', error);
        return null;
      }
    },
    ['site-settings-global'],
    {
      revalidate: 60,
      tags: ['settings'],
    }
  )();
});

/**
 * 2. Cached Landing Page by Slug
 * Pre-populates productIds and safely normalizes output.
 */
export const getCachedLandingPage = cache(async (slug: string) => {
  return unstable_cache(
    async () => {
      try {
        await dbConnect();
        // Prevent compiler tree-shaking of Product model
        const _forceRegister = Product.modelName;
        const raw = await LandingPage.findOne({ slug, isActive: true })
          .populate('productIds')
          .lean() as any;

        if (!raw) return null;
        return JSON.parse(JSON.stringify(raw));
      } catch (error) {
        console.error(`[dataCache] Error fetching landing page for slug "${slug}":`, error);
        return null;
      }
    },
    [`landing-page-${slug}`],
    {
      revalidate: 60,
      tags: ['landing-pages', `landing-page-${slug}`],
    }
  )();
});

/**
 * 3. Cached Product by Slug
 */
export const getCachedProduct = cache(async (slug: string) => {
  return unstable_cache(
    async () => {
      try {
        await dbConnect();
        const product = await Product.findOne({ slug }).lean();
        if (!product) return null;
        return JSON.parse(JSON.stringify(product));
      } catch (error) {
        console.error(`[dataCache] Error fetching product for slug "${slug}":`, error);
        return null;
      }
    },
    [`product-slug-${slug}`],
    {
      revalidate: 60,
      tags: ['products', `product-${slug}`],
    }
  )();
});

/**
 * 4. Cached Approved Product Reviews
 */
export const getCachedProductReviews = cache(async (productId: string) => {
  return unstable_cache(
    async () => {
      try {
        await dbConnect();
        const reviews = await Review.find({ product: productId, status: 'approved' })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean();
        return JSON.parse(JSON.stringify(reviews));
      } catch (error) {
        console.error(`[dataCache] Error fetching reviews for product "${productId}":`, error);
        return [];
      }
    },
    [`product-reviews-${productId}`],
    {
      revalidate: 60,
      tags: ['reviews', `product-reviews-${productId}`],
    }
  )();
});

/**
 * 5. Cached New Drop Products
 */
export const getCachedNewDropProducts = cache(async (): Promise<ProductItem[]> => {
  return unstable_cache(
    async () => {
      try {
        await dbConnect();
        let newDropProducts = await Product.find({ isNewArrival: true })
          .sort({ createdAt: -1 })
          .limit(8)
          .lean();

        if (newDropProducts.length < 8) {
          const dropIds = newDropProducts.map((p) => p._id);
          const fallbackProducts = await Product.find({ _id: { $nin: dropIds } })
            .sort({ createdAt: -1 })
            .limit(8 - newDropProducts.length)
            .lean();

          newDropProducts = [...newDropProducts, ...fallbackProducts];
        }
        return JSON.parse(JSON.stringify(newDropProducts));
      } catch (error) {
        console.error('[dataCache] Failed to load new drop products:', error);
        return [];
      }
    },
    ['home-new-drop-products'],
    {
      revalidate: 60,
      tags: ['products', 'home-products'],
    }
  )();
});

/**
 * 6. Cached Trending Products
 */
export const getCachedTrendingProducts = cache(async (): Promise<ProductItem[]> => {
  return unstable_cache(
    async () => {
      try {
        await dbConnect();
        let trendingProducts = await Product.find({ isTrending: true })
          .sort({ createdAt: -1 })
          .limit(8)
          .lean();

        if (trendingProducts.length < 8) {
          const trendingIds = trendingProducts.map((p) => p._id);
          const fallbackProducts = await Product.find({ _id: { $nin: trendingIds } })
            .sort({ createdAt: -1 })
            .limit(8 - trendingProducts.length)
            .lean();

          trendingProducts = [...trendingProducts, ...fallbackProducts];
        }
        return JSON.parse(JSON.stringify(trendingProducts));
      } catch (error) {
        console.error('[dataCache] Failed to load trending products:', error);
        return [];
      }
    },
    ['home-trending-products'],
    {
      revalidate: 60,
      tags: ['products', 'home-products'],
    }
  )();
});

/**
 * 7. Cached Category Products
 */
export const getCachedCategoryProducts = cache(async (slug: string) => {
  return unstable_cache(
    async () => {
      try {
        await dbConnect();
        const products = await Product.find({
          category: { $regex: new RegExp(`^${slug.replace('-', ' ')}$`, 'i') },
        }).lean();
        return JSON.parse(JSON.stringify(products));
      } catch (error) {
        console.error(`[dataCache] Failed to load category products for "${slug}":`, error);
        return [];
      }
    },
    [`category-products-${slug}`],
    {
      revalidate: 60,
      tags: ['products', `category-${slug}`],
    }
  )();
});
