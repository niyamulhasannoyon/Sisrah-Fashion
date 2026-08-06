'use client';

import { Truck, Award, RefreshCw, Banknote } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';

export function WhyChooseUs() {
  const { settings } = useSettingsStore();

  const title = settings?.whyShopTitle || 'WHY SHOP WITH US';
  const headline = settings?.whyShopHeadline || 'আপনার নির্ভরযোগ্য শপিং অভিজ্ঞতা';

  const features = [
    {
      id: 'feature-cod',
      icon: Banknote,
      title: settings?.whyShopFeature1Title || 'Cash on Delivery',
      bnTitle: settings?.whyShopFeature1BnTitle || 'ক্যাশ অন ডেলিভারি',
      description: settings?.whyShopFeature1Desc || 'পণ্য হাতে পেয়ে দেখে নেওয়ার সুবিধা সারা বাংলাদেশে।',
    },
    {
      id: 'feature-[#2]',
      icon: Truck,
      title: settings?.whyShopFeature2Title || 'Free Delivery',
      bnTitle: settings?.whyShopFeature2BnTitle || 'ফ্রি ডেলিভারি ৳২০০০+',
      description: settings?.whyShopFeature2Desc || '৳২০০০ বা তার বেশি অর্ডারে সারা দেশে ডেলিভারি সম্পূর্ণ ফ্রি।',
    },
    {
      id: 'feature-[#3]',
      icon: RefreshCw,
      title: settings?.whyShopFeature3Title || 'Easy 7-Day Exchange',
      bnTitle: settings?.whyShopFeature3BnTitle || '৭ দিনের সহজ এক্সচেঞ্জ',
      description: settings?.whyShopFeature3Desc || 'সাইজ বা ফিটিং নিয়ে সমস্যা হলে ৭ দিনের মধ্যে সহজে এক্সচেঞ্জ।',
    },
    {
      id: 'feature-[#4]',
      icon: Award,
      title: settings?.whyShopFeature4Title || '100% Original Fabric',
      bnTitle: settings?.whyShopFeature4BnTitle || '১০০% প্রিমিয়াম কোয়ালিটি',
      description: settings?.whyShopFeature4Desc || 'আরামদায়ক ফেব্রিকস ও ফিনিশিংয়ের গ্যারান্টি।',
    },
  ];

  return (
    <section className="bg-surface py-14 sm:py-20 border-t border-neutral-200/60 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14 flex flex-col items-center justify-center">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-brand mb-1.5">
            {title}
          </span>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900 font-bengali">
            {headline}
          </h2>
          <div className="w-10 h-0.5 bg-brand mt-3 rounded-full" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div 
                key={feature.id} 
                className="bg-white p-5 sm:p-7 rounded-2xl border border-neutral-200/70 shadow-subtle flex flex-col items-center text-center transition-all duration-300 hover:shadow-elevated hover:border-neutral-300"
              >
                <div className="w-11 h-11 sm:w-13 sm:h-13 bg-brand/10 text-brand rounded-full flex items-center justify-center mb-4 shrink-0">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.75} />
                </div>
                
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400">
                  {feature.title}
                </span>

                <h3 className="text-xs sm:text-sm font-bold text-neutral-900 font-bengali mt-1">
                  {feature.bnTitle}
                </h3>

                <p className="text-[10px] sm:text-xs text-neutral-600 font-bengali mt-1.5 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
