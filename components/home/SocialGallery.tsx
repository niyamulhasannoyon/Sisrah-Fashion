'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Image as ImageIcon } from 'lucide-react';

export function SocialGallery() {
  const { settings } = useSettingsStore();

  const defaultImages = [
    { url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop' },
    { url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600&auto=format&fit=crop' },
    { url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=600&auto=format&fit=crop' },
    { url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600&auto=format&fit=crop' },
    { url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=600&auto=format&fit=crop' },
  ];

  const images = settings?.communityImages && settings.communityImages.length > 0 
    ? settings.communityImages 
    : defaultImages;

  return (
    <section className="bg-white py-24 border-t border-slate-50 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="mb-12 text-center">
          <p className="text-[10px] font-black uppercase tracking-[4px] text-loomra-red mb-2">Our Community</p>
          <h2 className="text-4xl font-black uppercase tracking-tight text-loomra-black">Everyday style in real life <span className="text-loomra-red">.</span></h2>
          <p className="text-loomra-muted mt-2 text-sm">Tag us on Instagram <span className="font-bold text-loomra-black">@as_sidrat_official</span> to be featured.</p>
        </div>
        
        {/* Horizontal Scroll Layout for better community feel */}
        <div className="flex overflow-x-auto gap-4 pb-8 px-4 -mx-10 custom-scrollbar snap-x">
          {images.map((img, idx) => (
            <div key={idx} className="relative w-64 md:w-80 aspect-[4/5] shrink-0 snap-center rounded-2xl overflow-hidden group cursor-pointer shadow-md">
              <Image 
                src={img.url} 
                alt="Community Style" 
                fill
                sizes="(max-width: 768px) 256px, 320px"
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                loading="lazy"
              />
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2">
                <ImageIcon className="text-white" size={32} />
                <span className="text-white text-[10px] font-black uppercase tracking-widest border-b-2 border-white pb-1">Shop The Look</span>
              </div>
            </div>
          ))}
        </div>

        {/* View Full Gallery Link */}
        <div className="mt-8 text-center">
          <Link 
            href="/community" 
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-loomra-black border-b-2 border-loomra-black pb-1 hover:text-loomra-red hover:border-loomra-red transition-all duration-300"
          >
            <span>View Full Gallery</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
