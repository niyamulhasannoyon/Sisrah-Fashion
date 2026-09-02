'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSettingsStore } from '@/store/useSettingsStore';
import { ArrowRight, Sparkles } from 'lucide-react';
import { getDirectImageLink } from '@/lib/utils';
import type { SiteSettings } from '@/types';

function InstagramIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
    >
      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.01 3.71.054.937.04 1.612.189 2.185.411a4.896 4.896 0 011.626 1.057 4.896 4.896 0 011.057 1.625c.222.573.371 1.248.411 2.185.044.926.054 1.281.054 3.71s-.01 2.784-.054 3.71c-.04.937-.189 1.612-.411 2.185a4.896 4.896 0 01-1.057 1.626 4.896 4.896 0 01-1.625 1.057c-.573.222-1.248.371-2.185.411-.926.044-1.281.054-3.71.054s-2.784-.01-3.71-.054c-.937-.04-1.612-.189-2.185-.411a4.896 4.896 0 01-1.626-1.057 4.896 4.896 0 01-1.057-1.625c-.222-.573-.371-1.248-.411-2.185C2.01 16.1 2 15.745 2 13.315s.01-2.784.054-3.71c.04-.937.189-1.612.411-2.185a4.896 4.896 0 011.057-1.626 4.896 4.896 0 011.625-1.057c.573-.222 1.248-.371 2.185-.411.926-.044 1.281-.054 3.71-.054zM12 5.802a7.513 7.513 0 100 15.026 7.513 7.513 0 000-15.026zm0 1.802a5.711 5.711 0 110 11.422 5.711 5.711 0 010-11.422zm4.74-2.484a1.34 1.34 0 110 2.68 1.34 1.34 0 010-2.68z" clipRule="evenodd" />
    </svg>
  );
}

interface SocialGalleryProps {
  initialSettings?: SiteSettings | null;
}

export function SocialGallery({ initialSettings }: SocialGalleryProps) {
  const { settings: clientSettings } = useSettingsStore();

  const settings = clientSettings || initialSettings;

  const title = settings?.communityTitle || 'COMMUNITY GALLERY';
  const headline = settings?.communityHeadline || 'আমাদের হ্যাপি কাস্টমারদের স্টাইল .';
  const subheadline = settings?.communitySubheadline || 'ইনস্টাগ্রামে আমাদের ফলো করুন @as_sidrat_official নতুন সব কালেকশনের আউটফিট ইনস্পিরেশনের জন্য।';
  const instaHandle = settings?.instagramHandle || '@as_sidrat_official';

  const defaultImages = [
    { url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop' },
    { url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600&auto=format&fit=crop' },
    { url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=600&auto=format&fit=crop' },
    { url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600&auto=format&fit=crop' },
    { url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=600&auto=format&fit=crop' },
    { url: 'https://images.unsplash.com/photo-1554412930-e142e0549117?q=80&w=600&auto=format&fit=crop' },
  ];

  const rawImages = settings?.communityImages && settings.communityImages.length > 0 
    ? settings.communityImages 
    : defaultImages;

  // Ensure minimum items for continuous smooth looping
  let baseImages = [...rawImages];
  while (baseImages.length < 6) {
    baseImages = [...baseImages, ...rawImages];
  }

  // Duplicate for seamless 50% translation infinite loop
  const marqueeImages = [...baseImages, ...baseImages];

  return (
    <section className="bg-white py-16 sm:py-24 border-t border-slate-100 overflow-hidden relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="mb-10 sm:mb-14 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 mb-3">
            <Sparkles size={12} className="text-[#A31F24]" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#A31F24]">
              {title}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 font-bengali">
            {headline}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 font-bengali mt-2 max-w-xl leading-relaxed">
            {subheadline}
          </p>

          <Link
            href={instaHandle.startsWith('http') ? instaHandle : `https://instagram.com/${instaHandle.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-black transition-all group"
          >
            <InstagramIcon size={14} className="text-[#A31F24] group-hover:scale-110 transition-transform" />
            <span className="font-mono text-xs">{instaHandle}</span>
          </Link>
        </div>

      </div>

      {/* Full-width Single Row Auto-Moving Marquee */}
      <div className="relative w-full overflow-hidden py-2">
        {/* Left & Right Vignette / Gradient Fade Masks */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />

        {/* Moving Track */}
        <div className="marquee-gallery flex gap-4 sm:gap-6 items-center">
          {marqueeImages.map((img: any, idx: number) => {
            const resolvedSrc = getDirectImageLink(img?.url);
            if (!resolvedSrc) return null;

            return (
              <Link 
                key={idx}
                href="/community"
                className="relative w-52 sm:w-64 md:w-72 aspect-[4/5] shrink-0 rounded-2xl sm:rounded-3xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl border border-slate-200/70 bg-slate-100 transition-all duration-500 block"
              >
                <Image 
                  src={resolvedSrc} 
                  alt={`AS SIDRAT Community Style ${idx + 1}`} 
                  fill
                  sizes="(max-width: 640px) 208px, (max-width: 768px) 256px, 288px"
                  unoptimized
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />

                {/* Dark Gradient Backdrop on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5 z-10">
                  <div className="transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300 flex flex-col items-start gap-2">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold uppercase tracking-wider">
                      <InstagramIcon size={12} />
                      <span>{instaHandle}</span>
                    </div>
                    <span className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                      SHOP THE LOOK <ArrowRight size={12} />
                    </span>
                  </div>
                </div>

                {/* Subtle Luxury Corner Badge */}
                <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/70 backdrop-blur-md border border-white/60 flex items-center justify-center text-slate-800 shadow-xs group-hover:opacity-0 transition-opacity">
                  <InstagramIcon size={13} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* View Full Gallery Link */}
      <div className="mt-8 text-center">
        <Link 
          href="/community" 
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-900 border-b-2 border-slate-900 pb-1 hover:text-[#A31F24] hover:border-[#A31F24] transition-all duration-200"
        >
          <span>VIEW FULL LOOKBOOK</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
