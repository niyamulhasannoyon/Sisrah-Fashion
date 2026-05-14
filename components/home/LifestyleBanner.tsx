"use client";

import Link from 'next/link';
import { useSettingsStore } from '@/store/useSettingsStore';

export function LifestyleBanner() {
  const { settings } = useSettingsStore();
  const displayImage = settings?.ethosImage || "/images/brand-story.jpg";

  return (
    <section className="w-full bg-loomra-surface py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 sm:px-8 md:grid-cols-2 items-center">
        <div className="overflow-hidden rounded-none">
          <img
            src={displayImage}
            alt="Artisans at work"
            className="w-full object-cover transition-transform duration-700 hover:scale-105"
          />
        </div>
        <div className="flex flex-col gap-6">
          <span className="text-small uppercase tracking-widest text-loomra-red font-bold">Our Ethos</span>
          <h2 className="text-heading font-bold text-loomra-black leading-tight">
            Crafted for the Climate. Rooted in Tradition.
          </h2>
          <p className="text-body text-loomra-muted leading-relaxed">
            We source the finest long-staple cotton and breathable linens, combining global minimalist trends with fabrics that actually make sense for the South Asian weather.
          </p>
          <Link
            href="/about"
            className="self-start text-small uppercase tracking-widest border-b border-loomra-black pb-1 text-loomra-black transition-colors hover:border-loomra-red hover:text-loomra-red"
          >
            Read Our Story
          </Link>
        </div>
      </div>
    </section>
  );
}
