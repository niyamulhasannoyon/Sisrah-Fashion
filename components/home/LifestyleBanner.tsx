"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { getDirectImageLink } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

export function LifestyleBanner() {
  const { settings } = useSettingsStore();
  const displayImage = getDirectImageLink(settings?.ethosImage) || "/images/brand-story.jpg";

  const [imgSrc, setImgSrc] = useState(displayImage);

  useEffect(() => {
    setImgSrc(displayImage);
  }, [displayImage]);

  return (
    <section className="w-full bg-[#121214] text-white py-16 lg:py-24 border-t border-white/10">
      <div className="mx-auto grid max-w-7xl gap-8 lg:gap-12 px-4 sm:px-6 lg:px-8 md:grid-cols-2 items-center">
        
        {/* Visual Frame */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl aspect-[4/3] bg-stone-900 border border-white/10 shadow-2xl">
          <Image
            src={imgSrc}
            alt="AS SIDRAT Craftsmanship"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
            className="object-cover transition-transform duration-700 hover:scale-105"
            onError={() => {
              setImgSrc("https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=800&auto=format&fit=crop");
            }}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>

        {/* Brand Ethos Text (English UI tag + Bengali emotional storytelling copy) */}
        <div className="flex flex-col gap-4 sm:gap-5">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#A31F24]">
            OUR ETHOS
          </span>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight font-bengali text-white">
            {settings?.ethosHeadline || "জলবায়ুর সাথে সামঞ্জস্যপূর্ণ বুনন। সচেতন জীবনযাত্রা।"}
          </h2>

          <p className="text-xs sm:text-sm lg:text-base text-gray-300 leading-relaxed font-bengali font-normal">
            {settings?.ethosDescription || "আমরা বিশ্বসেরা বাতাস চলাচলকারী কাপড়—যেমন খাঁটি লিনেন ও সুতি বেছে নিই এমন পোশাক তৈরি করতে যা আমাদের আবহাওয়াকে সম্মান করে। প্রতিটি সেলাই ও বোতামের উদ্দেশ্য একটাই: আপনাকে স্বাচ্ছন্দ্যে নিঃশ্বাস নিতে দেওয়া।"}
          </p>

          <div className="pt-2">
            <Link
              href="/community"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white border-b-2 border-white pb-1 hover:text-[#A31F24] hover:border-[#A31F24] transition-all"
            >
              <span>READ OUR STORY</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
