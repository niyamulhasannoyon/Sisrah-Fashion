"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { LOOMRA_COPY } from '@/lib/constants/copy';
import { useSettingsStore } from '@/store/useSettingsStore';
import { getDirectImageLink } from '@/lib/utils';

export function HeroSection() {
  const { settings } = useSettingsStore();
  const [activeSlide, setActiveSlide] = useState(0);

  const headline = settings?.heroHeadline || LOOMRA_COPY.hero.primary.headline;
  const subheadline = settings?.heroSubheadline || LOOMRA_COPY.hero.primary.subheadline;
  
  // Fallbacks
  const defaultImage = getDirectImageLink(settings?.heroImage) || '/images/hero-model.jpg';
  const slides = settings?.heroImages && settings.heroImages.length > 0 
    ? settings.heroImages 
    : [{ url: defaultImage, public_id: 'default' }];

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <section className="relative h-[calc(100vh-80px)] w-full overflow-hidden">
      {/* Dynamic sliding backgrounds */}
      {slides.map((slide, index) => (
        <div 
          key={index}
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-[1500ms] ease-in-out ${
            index === activeSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
          }`}
          style={{ backgroundImage: `url('${getDirectImageLink(slide.url)}')` }}
        />
      ))}
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/25 z-0" />
      
      {/* Content */}
      <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col items-center justify-center gap-4 sm:gap-6 px-4 text-center">
        <span className="text-[10px] sm:text-xs uppercase tracking-[0.32em] text-[#A31F24] font-black">Summer Essentials</span>
        <h1 className="max-w-3xl text-xl sm:text-2xl md:text-4xl lg:text-[4.5rem] font-black uppercase tracking-normal text-white leading-snug font-bengali px-2 sm:px-4">
          {headline}
        </h1>
        <p className="max-w-xl text-xs sm:text-sm md:text-base font-normal text-white/90 font-bengali px-4 leading-relaxed">
          {subheadline}
        </p>
        <Link
          href="/shop"
          className="mt-2 sm:mt-4 inline-flex rounded-xl bg-[#A31F24] px-8 py-3 sm:px-10 sm:py-4 text-xs sm:text-sm font-bold uppercase tracking-widest text-white transition-all duration-300 hover:bg-red-800 hover:scale-[1.02] shadow-md"
        >
          {LOOMRA_COPY.cta.homepageHero}
        </Link>
      </div>

      {/* Pager Indicator Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveSlide(index)}
              className={`h-2.5 rounded-full transition-all duration-500 ${
                index === activeSlide 
                  ? 'w-8 bg-loomra-red' 
                  : 'w-2.5 bg-white/40 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

