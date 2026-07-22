'use client';

import { Truck, Award, RefreshCw, Banknote } from 'lucide-react';

const features = [
  {
    icon: Banknote,
    title: 'Cash on Delivery',
    bnTitle: 'ক্যাশ অন ডেলিভারি',
    description: 'পণ্য হাতে পেয়ে দেখে নেওয়ার সুবিধা সারা বাংলাদেশে।',
  },
  {
    icon: Truck,
    title: 'Free Delivery',
    bnTitle: 'ফ্রি ডেলিভারি ৳২০০০+',
    description: '৳২০০০ বা তার বেশি অর্ডারে সারা দেশে ডেলিভারি সম্পূর্ণ ফ্রি।',
  },
  {
    icon: RefreshCw,
    title: 'Easy 7-Day Exchange',
    bnTitle: '৭ দিনের সহজ এক্সচেঞ্জ',
    description: 'সাইজ বা ফিটিং নিয়ে সমস্যা হলে ৭ দিনের মধ্যে সহজে এক্সচেঞ্জ।',
  },
  {
    icon: Award,
    title: '100% Original Fabric',
    bnTitle: '১০০% প্রিমিয়াম কোয়ালিটি',
    description: 'আরামদায়ক ফেব্রিকস ও ফিনিশিংয়ের গ্যারান্টি।',
  },
];

export function WhyChooseUs() {
  return (
    <section className="bg-slate-50/60 py-12 sm:py-16 border-t border-slate-100 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="text-center mb-10 sm:mb-12 flex flex-col items-center justify-center">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#A31F24] mb-1.5">
            WHY SHOP WITH US
          </span>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 font-bengali">
            আপনার নির্ভরযোগ্য শপিং অভিজ্ঞতা
          </h2>
          <div className="w-10 h-0.5 bg-[#A31F24] mt-3 rounded-full" />
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div 
                key={idx} 
                className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col items-center text-center transition-all duration-300 hover:shadow-md hover:border-slate-200"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#A31F24]/10 text-[#A31F24] rounded-full flex items-center justify-center mb-3 shrink-0">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.8} />
                </div>
                
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                  {feature.title}
                </span>

                <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-bengali mt-1">
                  {feature.bnTitle}
                </h3>

                <p className="text-[10px] sm:text-xs text-slate-600 font-bengali mt-1.5 leading-relaxed">
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
