import { HeroSection } from '@/components/home/HeroSection';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { NewDrop } from '@/components/home/NewDrop';
import { TrendingSlider } from '@/components/home/TrendingSlider';
import { LifestyleBanner } from '@/components/home/LifestyleBanner';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { SocialGallery } from '@/components/home/SocialGallery';
import { ReviewMarquee } from '@/components/home/ReviewMarquee';
import { Newsletter } from '@/components/home/Newsletter';

import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export default async function HomePage() {
  let newDropProducts = [];
  let trendingProducts = [];

  try {
    await dbConnect();

    // 1. Get products explicitly marked as New Arrival
    let newDrops = await Product.find({ isNewArrival: true })
      .sort({ createdAt: -1 })
      .limit(8);

    // Fallback: fill with latest arrivals
    if (newDrops.length < 8) {
      const dropIds = newDrops.map(p => p._id);
      const additional = await Product.find({ _id: { $nin: dropIds } })
        .sort({ createdAt: -1 })
        .limit(8 - newDrops.length);
      newDrops = [...newDrops, ...additional];
    }
    newDropProducts = JSON.parse(JSON.stringify(newDrops));

    // 2. Get products explicitly marked as trending
    let trending = await Product.find({ isTrending: true })
      .sort({ createdAt: -1 })
      .limit(8);

    // Fallback: fill with latest products
    if (trending.length < 8) {
      const trendingIds = trending.map(p => p._id);
      const additional = await Product.find({ _id: { $nin: trendingIds } })
        .sort({ createdAt: -1 })
        .limit(8 - trending.length);
      trending = [...trending, ...additional];
    }
    trendingProducts = JSON.parse(JSON.stringify(trending));
  } catch (error) {
    console.error('Error fetching homepage products on server:', error);
  }

  return (
    <div className="bg-loomra-white text-loomra-black font-sans scroll-smooth">
      <main>
        <HeroSection />
        <CategoryGrid />
        <NewDrop initialProducts={newDropProducts} />
        <TrendingSlider initialProducts={trendingProducts} />
        <LifestyleBanner />
        <WhyChooseUs />
        <SocialGallery />
        <ReviewMarquee />
        <Newsletter />
      </main>
    </div>
  );
}
