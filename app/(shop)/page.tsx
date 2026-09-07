import dynamic from 'next/dynamic';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { NewDrop } from '@/components/home/NewDrop';
import { TrendingSlider } from '@/components/home/TrendingSlider';
import { LifestyleBanner } from '@/components/home/LifestyleBanner';
import {
  getCachedSettings,
  getCachedNewDropProducts,
  getCachedTrendingProducts,
} from '@/lib/dataCache';

const SocialGallery = dynamic(() => import('@/components/home/SocialGallery').then((mod) => mod.SocialGallery));
const ReviewMarquee = dynamic(() => import('@/components/home/ReviewMarquee').then((mod) => mod.ReviewMarquee));

export const revalidate = 60;

export default async function HomePage() {
  const [newDropProducts, trendingProducts, settings] = await Promise.all([
    getCachedNewDropProducts(),
    getCachedTrendingProducts(),
    getCachedSettings(),
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
