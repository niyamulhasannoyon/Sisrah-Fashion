"use client";

import Link from 'next/link';
import { LOOMRA_COPY } from '@/lib/constants/copy';
import { useSettingsStore } from '@/store/useSettingsStore';

export function HeroSection() {
  const { headline, subheadline } = LOOMRA_COPY.hero.primary;
  const { settings } = useSettingsStore();

  const backgroundImage = settings?.heroImage || '/images/hero-model.jpg';

  return (
    <section className="relative h-[calc(100vh-80px)] w-full overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
        style={{ backgroundImage: `url('${backgroundImage}')` }}
      />
      <div className="absolute inset-0 bg-black/25" />
      <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col items-center justify-center gap-6 px-6 text-center">
        <span className="text-small uppercase tracking-[0.32em] text-loomra-red">Summer Essentials</span>
        <h1 className="max-w-3xl text-heading md:text-[4rem] font-bold uppercase tracking-tight text-loomra-white leading-tight">
          {headline}
        </h1>
        <p className="max-w-xl text-body font-light text-loomra-white/90">
          {subheadline}
        </p>
        <Link
          href="/shop"
          className="mt-4 inline-flex rounded bg-loomra-red px-10 py-4 text-small font-bold uppercase tracking-widest text-loomra-white transition-colors hover:bg-red-800"
        >
          {LOOMRA_COPY.cta.homepageHero}
        </Link>
      </div>
    </section>
  );
}

