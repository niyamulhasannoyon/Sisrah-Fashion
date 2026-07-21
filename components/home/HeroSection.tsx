"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
    <motion.section 
      className="relative min-h-[calc(100dvh-80px)] w-full overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(event, info) => {
        const swipeThreshold = 50;
        if (info.offset.x > swipeThreshold) {
          // Swipe right -> previous slide
          setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
        } else if (info.offset.x < -swipeThreshold) {
          // Swipe left -> next slide
          setActiveSlide((prev) => (prev + 1) % slides.length);
        }
      }}
    >
      {/* Dynamic sliding backgrounds */}
      {slides.map((slide, index) => (
        <div 
          key={index}
          className={`absolute inset-0 transition-all duration-[5000ms] ease-out ${
            index === activeSlide ? 'opacity-100 scale-105' : 'opacity-0 scale-100 pointer-events-none'
          }`}
        >
          <Image
            src={getDirectImageLink(slide.url)}
            alt="AS SIDRAT — Premium Climate-Conscious Fashion in Bangladesh"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1920px"
            priority={index === 0}
            fetchPriority={index === 0 ? "high" : "auto"}
            className="object-cover object-center"
            quality={75}
          />
        </div>
      ))}
      
      {/* Bottom-heavy gradient overlay — darkens the text area without drowning the image top */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent z-0" />
      
      {/* Content */}
      <div className="relative z-10 mx-auto flex flex-col items-center justify-center min-h-[calc(100dvh-80px)] max-w-6xl gap-5 sm:gap-7 px-4 py-16 text-center">
        <span className="text-[10px] sm:text-xs uppercase tracking-[0.32em] text-[#A31F24] font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">Summer Essentials</span>
        <h1 className="max-w-4xl text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.3] sm:leading-[1.35] md:leading-[1.4] font-bengali px-2 sm:px-4 tracking-normal drop-shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
          {headline}
        </h1>
        <p className="max-w-2xl text-xs sm:text-sm md:text-base lg:text-lg font-normal text-white/90 font-bengali px-4 leading-relaxed mt-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
          {subheadline}
        </p>
        <Link
          href="/shop"
          className="mt-6 sm:mt-8 inline-flex items-center justify-center border border-white/50 bg-transparent text-white text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] px-8 py-4 rounded-none transition-all duration-300 hover:bg-white hover:text-black active:scale-95 shadow-sm"
        >
          VIEW COLLECTIONS
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
    </motion.section>
  );
}

