import { HeroSection } from '@/components/home/HeroSection';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { NewDrop } from '@/components/home/NewDrop';
import { TrendingSlider } from '@/components/home/TrendingSlider';
import { LifestyleBanner } from '@/components/home/LifestyleBanner';
import { SocialGallery } from '@/components/home/SocialGallery';
import { ReviewMarquee } from '@/components/home/ReviewMarquee';
import { Newsletter } from '@/components/home/Newsletter';

export default function HomePage() {
  return (
    <div className="bg-loomra-white text-loomra-black font-sans scroll-smooth">
      <main>
        <HeroSection />
        <CategoryGrid />
        <NewDrop />
        <TrendingSlider />
        <LifestyleBanner />
        <SocialGallery />
        <ReviewMarquee />
        <Newsletter />
      </main>
    </div>
  );
}
