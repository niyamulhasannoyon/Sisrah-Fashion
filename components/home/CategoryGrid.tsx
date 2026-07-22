'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { getDirectImageLink } from '@/lib/utils';
import { motion } from 'framer-motion';

export function CategoryGrid() {
  const { settings, fetchSettings } = useSettingsStore();

  useEffect(() => {
    if (!settings) {
      fetchSettings();
    }
  }, [settings, fetchSettings]);

  const categories = [
    {
      title: 'Men',
      bnSubtitle: 'অভিজাত ও স্বাচ্ছন্দ্যময় পুরুষদের পোশাক',
      href: '/category/men',
      image: settings?.categoryImageMen ? getDirectImageLink(settings.categoryImageMen) : 'https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=600&auto=format&fit=crop'
    },
    {
      title: 'Women',
      bnSubtitle: 'মিনিমালিস্ট ও মার্জিত নারীদের আউটফিট',
      href: '/category/women',
      image: settings?.categoryImageWomen ? getDirectImageLink(settings.categoryImageWomen) : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop'
    },
    {
      title: 'Fusion',
      bnSubtitle: 'ঐতিহ্য ও আধুনিকতার চমৎকার মেলবন্ধন',
      href: '/category/fusion',
      image: settings?.categoryImageFusion ? getDirectImageLink(settings.categoryImageFusion) : 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop'
    }
  ];

  return (
    <section className="bg-slate-50/50 py-16 lg:py-24 border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header (Functional UI English badge + Emotional copy Bengali headline) */}
        <div className="mb-10 lg:mb-12 flex flex-col gap-2 text-center">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#A31F24] font-bold">
            COLLECTIONS
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 font-bengali">
            পছন্দের ক্যাটাগরি বেছে নিন
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.href}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
              className={index === 2 ? 'col-span-2 md:col-span-1' : 'col-span-1'}
            >
              <Link
                href={category.href}
                className={`group relative h-[220px] md:h-[420px] overflow-hidden rounded-2xl bg-stone-900 shadow-xs hover:shadow-md transition-all duration-300 block ${
                  index === 2 ? 'h-[190px] md:h-[420px]' : ''
                }`}
              >
                {/* Background Image */}
                <Image 
                  src={category.image} 
                  alt={category.title} 
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent transition-opacity duration-300 group-hover:from-black/90" />
                
                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-between p-5 md:p-7 text-white z-10">
                  <div>
                    <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-[#A31F24] font-bold">
                      {category.title}
                    </span>
                    <h3 className="mt-1 text-sm md:text-xl font-bold tracking-wide leading-snug font-bengali text-gray-100">
                      {category.bnSubtitle}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-[10px] md:text-xs uppercase tracking-widest font-bold text-white border-b border-white/40 pb-1 self-start group-hover:border-[#A31F24] group-hover:text-[#A31F24] transition-all duration-300">
                    <span>SHOP {category.title}</span>
                    <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
