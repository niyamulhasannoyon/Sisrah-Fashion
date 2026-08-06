'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import { Loader2 } from 'lucide-react';
import type { ProductItem } from '@/types';

interface TrendingSliderProps {
  initialProducts?: ProductItem[];
}

export function TrendingSlider({ initialProducts }: TrendingSliderProps) {
  const [products, setProducts] = useState<ProductItem[]>(initialProducts || []);
  const [loading, setLoading] = useState(!initialProducts);

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      return;
    }

    fetch('/api/products/trending')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load trending products');
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
      <Loader2 className="animate-spin text-brand" size={28} />
    </div>
  );

  if (products.length === 0) return null;

  return (
    <section className="bg-surface py-16 lg:py-24 border-t border-neutral-200/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 lg:mb-12 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-brand">
              TRENDING NOW
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight font-bengali mt-1">
              জনপ্রিয় কালেকশনসমূহ <span className="text-brand">.</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 font-bengali mt-1.5 max-w-md">
              চলতি সিজনের সবচেয়ে পছন্দনীয় পোশাক, তৈরি আপনার প্রতিদিনের স্বাচ্ছন্দ্যের জন্য।
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-neutral-900 border-b-2 border-neutral-900 pb-1 hover:text-brand hover:border-brand transition-all self-start md:self-auto mt-3 md:mt-0"
          >
            <span>EXPLORE ALL</span>
            <span>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
