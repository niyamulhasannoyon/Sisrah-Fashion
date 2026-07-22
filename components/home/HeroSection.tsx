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
      className="relative w-full min-h-[75vh] md:min-h-[85vh] flex items-center justify-center text-center overflow-hidden cursor-grab active:cursor-grabbing"
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
      {slides.map((slide, index) => {
        const desktopSrc = getDirectImageLink(slide.url);
        const mobileSrc = slide.mobileUrl ? getDirectImageLink(slide.mobileUrl) : desktopSrc;
        
        return (
          <div 
            key={index}
            className={`absolute inset-0 transition-all duration-[5000ms] ease-out ${
              index === activeSlide ? 'opacity-100 scale-105' : 'opacity-0 scale-100 pointer-events-none'
            }`}
          >
            {/* Desktop Image */}
            <div className={`absolute inset-0 w-full h-full ${slide.mobileUrl ? 'hidden md:block' : 'block'}`}>
              <Image
                src={desktopSrc}
                alt="AS SIDRAT — Premium Climate-Conscious Fashion in Bangladesh"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1920px"
                priority={index === 0}
                fetchPriority={index === 0 ? "high" : "auto"}
                className="object-cover object-center"
                quality={75}
              />
            </div>
            {/* Mobile Image */}
            {slide.mobileUrl && (
              <div className="absolute inset-0 w-full h-full block md:hidden">
                <Image
                  src={mobileSrc}
                  alt="AS SIDRAT — Premium Climate-Conscious Fashion in Bangladesh (Mobile)"
                  fill
                  sizes="100vw"
                  priority={index === 0}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  className="object-cover object-center"
                  quality={75}
                />
              </div>
            )}
          </div>
        );
      })}
      
      {/* 2. Dark Overlay (টেক্সট স্পষ্ট দেখানোর মূল সমাধান) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 z-0" />
      
      {/* 3. Hero Content (Text Backplate/Glassmorphism & Mobile Font Scaling) */}
      <div className="relative z-10 max-w-xl mx-auto px-4 py-8 flex flex-col items-center">
        <div className="bg-black/45 backdrop-blur-xl border border-white/20 rounded-2xl p-6 sm:p-8 md:p-10 flex flex-col items-center text-center shadow-xl">
          {/* Summer Essentials Tag */}
          <span className="text-red-500 font-bold tracking-[0.2em] text-xs md:text-sm uppercase mb-3">
            SUMMER ESSENTIALS
          </span>

          {/* Main Headline */}
          <h1 className="text-white font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-snug mb-4 drop-shadow-md text-balance font-bengali">
            {headline}
          </h1>

          {/* Subtitle / Paragraph */}
          <p className="text-slate-100 text-sm sm:text-base max-w-md mb-6 leading-relaxed font-bengali text-pretty">
            {subheadline}
          </p>

          {/* CTA Button */}
          <Link
            href="/shop"
            className="inline-block border-2 border-white text-white font-semibold text-xs md:text-sm px-8 py-3.5 tracking-widest hover:bg-white hover:text-black transition-all duration-300 backdrop-blur-sm"
          >
            VIEW COLLECTIONS
          </Link>
        </div>
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

