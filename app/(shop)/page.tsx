import { HeroSection } from '@/components/home/HeroSection';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { ReviewMarquee } from '@/components/home/ReviewMarquee';
import { Newsletter } from '@/components/home/Newsletter';
import { NewDrop } from '@/components/home/NewDrop';
import { TrendingSlider } from '@/components/home/TrendingSlider';
import { LifestyleBanner } from '@/components/home/LifestyleBanner';
import { SocialGallery } from '@/components/home/SocialGallery';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export const revalidate = 60;

async function getNewDropProducts() {
  try {
    await dbConnect();
    // 1. Get products explicitly marked as New Arrival
    let newDropProducts = await Product.find({ isNewArrival: true })
                                         .sort({ createdAt: -1 })
                                         .limit(8)
                                         .lean(); 
    
    // 2. Fallback: If we have fewer than 8 marked products, fill with latest arrivals
    if (newDropProducts.length < 8) {
      const dropIds = newDropProducts.map(p => p._id);
      const additionalProducts = await Product.find({ _id: { $nin: dropIds } })
                                               .sort({ createdAt: -1 })
                                               .limit(8 - newDropProducts.length)
                                               .lean();
      
      newDropProducts = [...newDropProducts, ...additionalProducts];
    }
    return JSON.parse(JSON.stringify(newDropProducts));
  } catch (error) {
    console.error('Error fetching new drop products:', error);
    return [];
  }
}

async function getTrendingProducts() {
  try {
    await dbConnect();
    // 1. Get products explicitly marked as trending
    let trendingProducts = await Product.find({ isTrending: true })
                                         .sort({ createdAt: -1 })
                                         .limit(8)
                                         .lean(); 
    
    // 2. If we have fewer than 8 trending products, fill the rest with latest products
    if (trendingProducts.length < 8) {
      const trendingIds = trendingProducts.map(p => p._id);
      const additionalProducts = await Product.find({ _id: { $nin: trendingIds } })
                                               .sort({ createdAt: -1 })
                                               .limit(8 - trendingProducts.length)
                                               .lean();
      
      trendingProducts = [...trendingProducts, ...additionalProducts];
    }
    return JSON.parse(JSON.stringify(trendingProducts));
  } catch (error) {
    console.error('Error fetching trending products:', error);
    return [];
  }
}

export default async function HomePage() {
  const [newDropProducts, trendingProducts] = await Promise.all([
    getNewDropProducts(),
    getTrendingProducts()
  ]);

  return (
    <div className="bg-loomra-white text-loomra-black font-sans scroll-smooth">
      <main>
        {/* Hero */}
        <HeroSection />
        
        {/* Category Grid */}
        <CategoryGrid />
        
        {/* New Drop */}
        <NewDrop initialProducts={newDropProducts} />
        
        {/* Trending */}
        <TrendingSlider initialProducts={trendingProducts} />
        
        {/* Lifestyle Banner */}
        <LifestyleBanner />
        
        {/* Static sections */}
        <WhyChooseUs />
        <SocialGallery />
        <ReviewMarquee />
        <Newsletter />
      </main>
    </div>
  );
}
