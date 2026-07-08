'use client';

import { Truck, Award, RefreshCw, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Nationwide Fast Delivery',
    description: 'Reliable and swift home delivery across Bangladesh.',
  },
  {
    icon: Award,
    title: 'Premium Craftsmanship',
    description: 'Assurance of high-quality fabrics and fine threads.',
  },
  {
    icon: RefreshCw,
    title: 'Easy & Hassle-Free Returns',
    description: 'Convenient 7-day exchange window for any item.',
  },
  {
    icon: ShieldCheck,
    title: '100% Secure Payments',
    description: 'Safe online payment gateways and cash-on-delivery options.',
  },
];

export function WhyChooseUs() {
  return (
    <section className="bg-loomra-white py-16 sm:py-24 border-t border-gray-100 overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        
        {/* Header Block */}
        <div className="text-center mb-16 relative flex flex-col items-center justify-center">
          {/* Top Red Dots */}
          <span className="text-loomra-red text-xl font-bold tracking-[0.3em] mb-2 leading-none">...</span>
          
          {/* Watermark and Foreground Title Container */}
          <div className="relative w-full flex items-center justify-center min-h-[80px]">
            {/* Background Watermark */}
            <span aria-hidden="true" className="absolute text-[2.2rem] xs:text-[2.6rem] sm:text-[5rem] lg:text-[6.5rem] font-black uppercase tracking-[0.05em] text-gray-50/70 select-none pointer-events-none font-sans z-0 leading-none text-center whitespace-nowrap">
              WHY CHOOSE US
            </span>
            
            {/* Foreground Title */}
            <h2 className="relative text-2xl sm:text-3xl font-bold text-loomra-black z-10 leading-relaxed py-2">
              Why Choose Us?
            </h2>
          </div>
          
          {/* Underline Divider */}
          <div className="w-12 h-1 bg-loomra-red mt-4 rounded-full" />
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div 
                key={idx} 
                className="bg-white p-8 rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex flex-col items-center text-center transition-all duration-300 hover:shadow-[0_15px_40px_rgba(0,0,0,0.05)] hover:border-gray-200/60"
              >
                <div className="w-12 h-12 bg-loomra-red/5 text-loomra-red rounded-full flex items-center justify-center mb-5">
                  <Icon size={24} strokeWidth={2} />
                </div>
                <h3 className="text-base font-bold text-loomra-black leading-relaxed">
                  {feature.title}
                </h3>
                <p className="text-xs text-loomra-muted mt-3 leading-relaxed">
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
