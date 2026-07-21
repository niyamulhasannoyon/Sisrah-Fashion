'use client';

import { useSettingsStore } from '@/store/useSettingsStore';
import { useEffect } from 'react';
import { Camera, Image as ImageIcon } from 'lucide-react';
import { getDirectImageLink } from '@/lib/utils';
import Image from 'next/image';

export default function CommunityClient() {
  const { settings, fetchSettings } = useSettingsStore();

  useEffect(() => {
    if (!settings) {
      fetchSettings();
    }
  }, [settings, fetchSettings]);

  const defaultImages = [
    { url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop' },
    { url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600&auto=format&fit=crop' },
    { url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=600&auto=format&fit=crop' },
    { url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600&auto=format&fit=crop' },
    { url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=600&auto=format&fit=crop' },
    { url: 'https://images.unsplash.com/photo-1554412930-e142e0549117?q=80&w=600&auto=format&fit=crop' },
  ];

  const images = settings?.communityImages && settings.communityImages.length > 0 
    ? settings.communityImages 
    : defaultImages;

  return (
    <div className="bg-[#FBFBFB] min-h-screen py-16 font-sans">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <p className="text-[10px] font-black uppercase tracking-[4px] text-loomra-red mb-2">Style Lookbook</p>
          <h1 className="text-4xl font-black uppercase tracking-tight text-loomra-black flex items-center justify-center gap-2">
            <Camera className="text-loomra-red" size={28} /> Style Inspiration
          </h1>
          <p className="text-loomra-muted mt-2 text-sm max-w-md mx-auto">
            Explore our carefully curated lookbook showcasing our premium climate-conscious silhouettes in contemporary daily life. Follow us on Instagram <span className="font-bold text-loomra-black">@as_sidrat_official</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((img, idx) => (
            <div key={idx} className="relative aspect-[4/5] rounded-3xl overflow-hidden group cursor-pointer shadow-md bg-white border border-slate-100">
              <Image 
                src={getDirectImageLink(img.url)} 
                alt="Community Style" 
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1200px) 33vw, 25vw"
                className="object-cover transition-transform duration-[1000ms] group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 z-10">
                <ImageIcon className="text-white" size={32} />
                <span className="text-white text-[10px] font-black uppercase tracking-widest border-b-2 border-white pb-1">Shop The Look</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
