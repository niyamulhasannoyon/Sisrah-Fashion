'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/product/ProductCard';
import { Loader2 } from 'lucide-react';
import type { ProductItem } from '@/types';

interface NewDropProps {
  initialProducts?: ProductItem[];
}

export function NewDrop({ initialProducts }: NewDropProps) {
  const [products, setProducts] = useState<ProductItem[]>(initialProducts || []);
  const [loading, setLoading] = useState(!initialProducts);

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      return;
    }

    fetch('/api/products/new-drop')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load new drop products');
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setProducts(data.products);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching new drop products:", err);
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
    <section className="bg-surface-paper py-16 lg:py-24 border-y border-neutral-200/60 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-10">
          <div>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-brand">
              NEW ARRIVALS
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 font-bengali mt-1">
              নতুন ড্রপ কালেকশন দেখে নিন <span className="text-brand">.</span>
            </h2>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500 mt-3 md:mt-0">
            <span>SWIPE FOR MORE</span>
            <span className="text-neutral-900 text-sm">→</span>
          </div>
        </div>

        <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-6 snap-x custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {products.map((product) => (
            <div key={product._id} className="min-w-[260px] sm:min-w-[280px] md:min-w-[300px] snap-start shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
