'use client';

import type { CustomerReview } from '@/types';

const reviews: CustomerReview[] = [
  {
    id: 'rev-1',
    name: 'তানভীর আহমেদ',
    location: 'ঢাকা',
    rating: 5,
    comment: '“AS SIDRAT-এর লিনেন শার্টগুলো যেমন আরামদায়ক, তেমনই দারুণ এডিটিং!”',
    verified: true,
    date: '২ দিন আগে'
  },
  {
    id: 'rev-2',
    name: 'রাশেদুল হাসান',
    location: 'চট্টগ্রাম',
    rating: 5,
    comment: '“ঢাকার গরম ও ভ্যাপসা আবহাওয়ায় কাপড়গুলো সত্যিই খুব আরামদায়ক লাগে।”',
    verified: true,
    date: '৩ দিন আগে'
  },
  {
    id: 'rev-3',
    name: 'সাব্বির হোসাইন',
    location: 'সিলেট',
    rating: 5,
    comment: '“মিনিমালিস্ট ডিজাইন আর চমৎকার ফিনিশিং। অনেক পছন্দ হয়েছে!”',
    verified: true,
    date: '১ সপ্তাহ আগে'
  },
  {
    id: 'rev-4',
    name: 'মাহমুদ করিম',
    location: 'রাজশাহী',
    rating: 5,
    comment: '“ক্যাশ অন ডেলিভারিতে দ্রুত ডেলিভারি পেয়েছি। কোয়ালিটি নিয়ে ১০০% স্যাটিসফাইড।”',
    verified: true,
    date: '৫ দিন আগে'
  },
  {
    id: 'rev-5',
    name: 'ইমরান খান',
    location: 'কুমিল্লা',
    rating: 5,
    comment: '“অর্ডিনারি ব্র্যান্ডগুলোর চেয়ে এদের সুইং ও কাটিং অনেক বেশি প্রিমিয়াম।”',
    verified: true,
    date: '৪ দিন আগে'
  },
  {
    id: 'rev-6',
    name: 'আরিফুল ইসলাম',
    location: 'খুলনা',
    rating: 5,
    comment: '“ফেব্রিকস অনেক লাইটওয়েট আর বাতাস চলাচলের উপযোগী।”',
    verified: true,
    date: '১ দিন আগে'
  }
];

export function ReviewMarquee() {
  return (
    <section className="bg-editorial-dark text-white py-12 overflow-hidden border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden">
          <div className="marquee flex gap-10 text-xs sm:text-sm font-semibold font-bengali text-neutral-200">
            {reviews.concat(reviews).map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex items-center gap-6 shrink-0">
                <span className="whitespace-nowrap">{item.comment}</span>
                <div className="flex items-center gap-1 text-brand text-xs font-sans font-bold">
                  <span>★ ★ ★ ★ ★</span>
                  <span className="text-[10px] text-neutral-400 font-normal">({item.location})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
