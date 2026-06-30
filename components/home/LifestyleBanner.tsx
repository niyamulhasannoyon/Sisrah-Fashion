"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { getDirectImageLink } from '@/lib/utils';

export function LifestyleBanner() {
  const { settings } = useSettingsStore();
  const displayImage = getDirectImageLink(settings?.ethosImage) || "/images/brand-story.jpg";

  const [imgSrc, setImgSrc] = useState(displayImage);

  useEffect(() => {
    setImgSrc(displayImage);
  }, [displayImage]);

  return (
    <section className="w-full bg-loomra-surface py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 sm:px-8 md:grid-cols-2 items-center">
        <div className="relative overflow-hidden rounded-none aspect-[4/3] bg-loomra-surface">
          <Image
            src={imgSrc}
            alt="Artisans at work"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 hover:scale-105"
            onError={() => {
              setImgSrc("https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=800&auto=format&fit=crop");
            }}
            loading="lazy"
          />
        </div>
        <div className="flex flex-col gap-6">
          <span className="text-small uppercase tracking-widest text-loomra-red font-bold">Our Ethos</span>
          <h2 className="text-heading font-bold text-loomra-black leading-tight">
            {settings?.ethosHeadline || "Crafted for the Climate. Rooted in Tradition."}
          </h2>
          <p className="text-body text-loomra-muted leading-relaxed">
            {settings?.ethosDescription || "We source the finest long-staple cotton and breathable linens, combining global minimalist trends with fabrics that actually make sense for the South Asian weather."}
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
