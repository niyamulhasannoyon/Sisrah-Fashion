"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LOOMRA_COPY } from '@/lib/constants/copy';
import { useSettingsStore } from '@/store/useSettingsStore';
import { getDirectImageLink } from '@/lib/utils';
import { ArrowRight, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export function HeroSection() {
  const { settings } = useSettingsStore();
  const [activeSlide, setActiveSlide] = useState(0);

  const headline = settings?.heroHeadline || LOOMRA_COPY.hero.primary.headline;
  const subheadline = settings?.heroSubheadline || LOOMRA_COPY.hero.primary.subheadline;
  
  // Fallback high-quality lifestyle imagery
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
    <section className="relative w-full bg-[#121214] text-white py-6 lg:py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Subtle Background Lighting Accent */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#A31F24]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl">
        {/* Desktop 2-Column Split / Mobile Stacked Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Brand Copy & CTAs (Cols 1-7 on desktop) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-5 lg:space-y-6 z-10 py-2 sm:py-4">
            
            {/* Tag Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#A31F24] animate-pulse" />
              <span className="text-[11px] sm:text-xs font-bold tracking-[0.25em] uppercase text-gray-200">
                SUMMER ESSENTIALS 2026
              </span>
            </div>

            {/* Main Headline (Bengali font tuned for crisp readability) */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-snug sm:leading-tight lg:leading-[1.2] font-bengali drop-shadow-sm">
              {headline}
            </h1>

            {/* Subtitle / Description (Bengali font) */}
            <p className="text-xs sm:text-sm lg:text-base text-gray-300 leading-relaxed font-bengali max-w-xl font-normal">
              {subheadline}
            </p>

            {/* Primary & Secondary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2.5 bg-[#A31F24] hover:bg-[#8B1A1E] text-white font-bold text-xs sm:text-sm px-7 py-3.5 rounded-xl tracking-wider uppercase shadow-lg shadow-[#A31F24]/20 transition-all duration-200 active:scale-[0.98]"
              >
                <span>VIEW COLLECTIONS</span>
                <ArrowRight size={16} />
              </Link>
              
              <Link
                href="/category/men"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs sm:text-sm px-6 py-3.5 rounded-xl tracking-wider uppercase backdrop-blur-sm transition-all duration-200"
              >
                <span>SHOP MEN</span>
              </Link>
            </div>

            {/* Micro Trust Points (BD E-commerce Quick Badges) */}
            <div className="pt-4 border-t border-white/10 w-full grid grid-cols-3 gap-2 text-gray-300 font-bengali text-[11px] sm:text-xs">
              <div className="flex items-center gap-1.5">
                <Truck size={14} className="text-[#A31F24] shrink-0" />
                <span>ক্যাশ অন ডেলিভারি</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#A31F24] shrink-0" />
                <span>১০০% অরিজিনাল</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RefreshCw size={14} className="text-[#A31F24] shrink-0" />
                <span>৭ দিনে রিটার্ন</span>
              </div>
            </div>

          </div>

          {/* Right Column: Lifestyle Showcase Visual Frame (Cols 8-12 on desktop) */}
          <div className="lg:col-span-5 relative w-full h-[380px] sm:h-[460px] lg:h-[520px]">
            {/* Visual Frame Container with consistent rounded corners across screen sizes */}
            <motion.div 
              className="relative w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-stone-900 group cursor-grab active:cursor-grabbing"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                const swipeThreshold = 50;
                if (info.offset.x > swipeThreshold) {
                  setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
                } else if (info.offset.x < -swipeThreshold) {
                  setActiveSlide((prev) => (prev + 1) % slides.length);
                }
              }}
            >
              <AnimatePresence mode="wait">
                {slides.map((slide, index) => {
                  if (index !== activeSlide) return null;
                  const desktopSrc = getDirectImageLink(slide.url);
                  const mobileSrc = slide.mobileUrl ? getDirectImageLink(slide.mobileUrl) : desktopSrc;

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="absolute inset-0 w-full h-full"
                    >
                      {/* Desktop Imagery */}
                      <div className={`relative w-full h-full ${slide.mobileUrl ? 'hidden md:block' : 'block'}`}>
                        <Image
                          src={desktopSrc}
                          alt="AS SIDRAT — Premium Lifestyle Fashion"
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                          priority={index === 0}
                          fetchPriority={index === 0 ? "high" : "auto"}
                          className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                          quality={85}
                        />
                      </div>

                      {/* Mobile Imagery */}
                      {slide.mobileUrl && (
                        <div className="relative w-full h-full block md:hidden">
                          <Image
                            src={mobileSrc}
                            alt="AS SIDRAT — Premium Lifestyle Fashion (Mobile)"
                            fill
                            sizes="100vw"
                            priority={index === 0}
                            fetchPriority={index === 0 ? "high" : "auto"}
                            className="object-cover object-center"
                            quality={85}
                          />
                        </div>
                      )}

                      {/* Gradient Overlay for photo contrast */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                      {/* Photo Badge overlay */}
                      <div className="absolute bottom-4 left-4 right-4 p-3 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-between text-xs text-white">
                        <span className="font-bold tracking-wider uppercase text-[10px] sm:text-xs">Premium Collection</span>
                        <span className="text-gray-300 text-[10px]">Bangladesh Original</span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Slider Dots */}
              {slides.length > 1 && (
                <div className="absolute top-4 right-4 z-20 flex gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/10">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveSlide(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === activeSlide 
                          ? 'w-5 bg-[#A31F24]' 
                          : 'w-2 bg-white/40 hover:bg-white/70'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
