'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { getDirectImageLink } from '@/lib/utils';

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
      subtitle: 'Tailored essentials',
      href: '/category/men',
      image: settings?.categoryImageMen ? getDirectImageLink(settings.categoryImageMen) : 'https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=600&auto=format&fit=crop'
    },
    {
      title: 'Women',
      subtitle: 'Minimal silhouettes',
      href: '/category/women',
      image: settings?.categoryImageWomen ? getDirectImageLink(settings.categoryImageWomen) : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop'
    },
    {
      title: 'Fusion',
      subtitle: 'Modern heritage',
      href: '/category/fusion',
      image: settings?.categoryImageFusion ? getDirectImageLink(settings.categoryImageFusion) : 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop'
    }
  ];
  return (
    <section className="bg-loomra-white py-24">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="mb-12 flex flex-col gap-4 text-center">
          <p className="text-sm uppercase tracking-[0.32em] text-loomra-red font-bold font-sans">Collections</p>
          <h2 className="text-4xl font-black uppercase tracking-tight text-loomra-black">Shop by category</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.href}
              href={category.href}
              className={`group relative h-[220px] md:h-[450px] overflow-hidden rounded-2xl bg-loomra-surface shadow-sm hover:shadow-md transition-all duration-305 block ${
                index === 2 ? 'col-span-2 md:col-span-1 h-[180px] md:h-[450px]' : 'col-span-1'
              }`}
            >
              {/* Background Image with zoom on hover */}
              <Image 
                src={category.image} 
                alt={category.title} 
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
              {/* Dark Overlay for contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15 transition-opacity duration-300 group-hover:from-black/90" />
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-between p-5 md:p-8 text-white z-10">
                <div>
                  <p className="text-[10px] md:text-xs uppercase tracking-[0.24em] text-loomra-red font-black">{category.title}</p>
                  <h3 className="mt-1 md:mt-2 text-base md:text-2xl font-black uppercase tracking-wide leading-tight">{category.subtitle}</h3>
                </div>
                
                <div className="flex items-center gap-1.5 text-[10px] md:text-xs uppercase tracking-widest font-bold text-white border-b border-white/40 pb-1 self-start group-hover:border-loomra-red group-hover:text-loomra-red transition-all duration-300">
                  <span>Shop {category.title}</span>
                  <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
