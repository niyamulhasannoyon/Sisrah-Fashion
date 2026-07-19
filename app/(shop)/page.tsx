import { Suspense } from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { ReviewMarquee } from '@/components/home/ReviewMarquee';
import { Newsletter } from '@/components/home/Newsletter';
import nextDynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const NewDrop = nextDynamic(() => import('@/components/home/NewDrop').then(mod => mod.NewDrop));
const TrendingSlider = nextDynamic(() => import('@/components/home/TrendingSlider').then(mod => mod.TrendingSlider));
const LifestyleBanner = nextDynamic(() => import('@/components/home/LifestyleBanner').then(mod => mod.LifestyleBanner));
const SocialGallery = nextDynamic(() => import('@/components/home/SocialGallery').then(mod => mod.SocialGallery));

// Loading skeleton for dynamic sections
function SectionSkeleton() {
  return (
    <div className="py-20 flex justify-center items-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-loomra-red" size={28} />
        <span className="text-[10px] font-black uppercase tracking-[3px] text-gray-400">Loading...</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="bg-loomra-white text-loomra-black font-sans scroll-smooth">
      <main>
        {/* Hero — static shell, handles its own client-side settings fetch */}
        <HeroSection />
        
        {/* Category Grid — static shell, fetches settings images client-side */}
        <CategoryGrid />
        
        {/* New Drop — fully client-side fetched, wrapped in Suspense */}
        <Suspense fallback={<SectionSkeleton />}>
          <NewDrop />
        </Suspense>
        
        {/* Trending — fully client-side fetched, wrapped in Suspense */}
        <Suspense fallback={<SectionSkeleton />}>
          <TrendingSlider />
        </Suspense>
        
        {/* Lifestyle Banner — static shell, handles own settings fetch */}
        <LifestyleBanner />
        
        {/* Static sections — no data fetching needed */}
        <WhyChooseUs />
        <SocialGallery />
        <ReviewMarquee />
        <Newsletter />
      </main>
    </div>
  );
}
