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
    <section className="bg-white py-16 lg:py-24 border-t border-slate-100 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="mb-10 text-center flex flex-col items-center">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#A31F24] mb-1">
            COMMUNITY GALLERY
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 font-bengali">
            আমাদের হ্যাপি কাস্টমারদের স্টাইল <span className="text-[#A31F24]">.</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-bengali mt-1.5 max-w-md">
            ইনস্টাগ্রামে আমাদের ফলো করুন <span className="font-bold text-slate-900 font-sans">@as_sidrat_official</span> নতুন সব কালেকশনের আউটফিট ইনস্পিরেশনের জন্য।
          </p>
        </div>
        
        {/* Horizontal Scroll Layout */}
        <div className="flex overflow-x-auto gap-4 pb-6 px-4 -mx-4 custom-scrollbar snap-x">
          {images.map((img, idx) => (
            <div key={idx} className="relative w-60 sm:w-72 md:w-80 aspect-[4/5] shrink-0 snap-center rounded-2xl overflow-hidden group cursor-pointer shadow-xs border border-slate-100">
              <Image 
                src={img.url} 
                alt="AS SIDRAT Community Style" 
                fill
                sizes="(max-width: 768px) 240px, 320px"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2">
                <ImageIcon className="text-white" size={28} />
                <span className="text-white text-[10px] font-bold uppercase tracking-widest border-b border-white pb-0.5">
                  SHOP THE LOOK
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* View Full Gallery Link */}
        <div className="mt-6 text-center">
          <Link 
            href="/community" 
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-1 hover:text-[#A31F24] hover:border-[#A31F24] transition-all duration-200"
          >
            <span>VIEW FULL GALLERY</span>
            <span>→</span>
          </Link>
        </div>

      </div>
    </section>
  );
}
