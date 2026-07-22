'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/product/ProductCard';
import { Loader2 } from 'lucide-react';

export function TrendingSlider({ initialProducts }: { initialProducts?: any[] }) {
  const [products, setProducts] = useState<any[]>(initialProducts || []);
  const [loading, setLoading] = useState(!initialProducts);

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      return;
    }

    fetch('/api/products/trending')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setProducts(data.products);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching trending products:", err);
        setLoading(false);
      });
  }, [initialProducts]);

  if (loading) return (
    <div className="py-16 flex justify-center items-center">
      <Loader2 className="animate-spin text-[#A31F24]" size={28} />
    </div>
  );

  if (products.length === 0) return null;

  return (
    <section className="bg-slate-50/50 py-16 lg:py-24 border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="mb-10 lg:mb-12 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#A31F24]">
              TRENDING NOW
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight font-bengali mt-1">
              জনপ্রিয় কালেকশনসমূহ <span className="text-[#A31F24]">.</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-bengali mt-1.5 max-w-md">
              চলতি সিজনের সবচেয়ে পছন্দনীয় পোশাক, তৈরি আপনার প্রতিদিনের স্বাচ্ছন্দ্যের জন্য।
            </p>
          </div>

          <a
            href="/shop"
            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-900 pb-1 hover:text-[#A31F24] hover:border-[#A31F24] transition-all self-start md:self-auto mt-3 md:mt-0"
          >
            <span>EXPLORE ALL</span>
            <span>→</span>
          </a>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

      </div>
    </section>
  );
}
