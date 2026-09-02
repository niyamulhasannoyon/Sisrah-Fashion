import dynamic from 'next/dynamic';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { NewDrop } from '@/components/home/NewDrop';
import { TrendingSlider } from '@/components/home/TrendingSlider';
import { LifestyleBanner } from '@/components/home/LifestyleBanner';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import Settings from '@/models/Settings';
import type { ProductItem, SiteSettings } from '@/types';

const SocialGallery = dynamic(() => import('@/components/home/SocialGallery').then((mod) => mod.SocialGallery));
const ReviewMarquee = dynamic(() => import('@/components/home/ReviewMarquee').then((mod) => mod.ReviewMarquee));

export const revalidate = 60;

async function getSettings(): Promise<SiteSettings | null> {
  try {
    await dbConnect();
    const settings = await Settings.findOne().lean();
    return settings ? JSON.parse(JSON.stringify(settings)) : null;
  } catch (error) {
    console.error('Failed to resolve site settings:', error);
    return null;
  }
}

async function getNewDropProducts(): Promise<ProductItem[]> {
  try {
    await dbConnect();
    let newDropProducts = await Product.find({ isNewArrival: true })
                                         .sort({ createdAt: -1 })
                                         .limit(8)
                                         .lean();

    if (newDropProducts.length < 8) {
      const dropIds = newDropProducts.map(p => p._id);
      const fallbackProducts = await Product.find({ _id: { $nin: dropIds } })
                                             .sort({ createdAt: -1 })
                                             .limit(8 - newDropProducts.length)
                                             .lean();

      newDropProducts = [...newDropProducts, ...fallbackProducts];
    }
    return JSON.parse(JSON.stringify(newDropProducts));
  } catch (error) {
    console.error('Failed to load new drop products:', error);
    return [];
  }
}

async function getTrendingProducts(): Promise<ProductItem[]> {
  try {
    await dbConnect();
    let trendingProducts = await Product.find({ isTrending: true })
                                         .sort({ createdAt: -1 })
                                         .limit(8)
                                         .lean();

    if (trendingProducts.length < 8) {
      const trendingIds = trendingProducts.map(p => p._id);
      const fallbackProducts = await Product.find({ _id: { $nin: trendingIds } })
                                             .sort({ createdAt: -1 })
                                             .limit(8 - trendingProducts.length)
                                             .lean();

      trendingProducts = [...trendingProducts, ...fallbackProducts];
    }
    return JSON.parse(JSON.stringify(trendingProducts));
  } catch (error) {
    console.error('Failed to load trending products:', error);
    return [];
  }
}

export default async function HomePage() {
  const [newDropProducts, trendingProducts, settings] = await Promise.all([
    getNewDropProducts(),
    getTrendingProducts(),
    getSettings(),
  ]);

  return (
    <div className="bg-surface-paper text-neutral-900 font-sans scroll-smooth">
      <main>
        <HeroSection initialSettings={settings} />
        <CategoryGrid />
        <NewDrop initialProducts={newDropProducts} />
        <TrendingSlider initialProducts={trendingProducts} />
        <LifestyleBanner />
        <WhyChooseUs />
        <SocialGallery initialSettings={settings} />
        <ReviewMarquee />
      </main>
    </div>
  );
}
