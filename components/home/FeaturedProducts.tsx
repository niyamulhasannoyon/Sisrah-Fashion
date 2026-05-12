'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/product/ProductCard';
import { Loader2 } from 'lucide-react';

export function FeaturedProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Show top 4 latest products
          setProducts(data.products.slice(0, 4));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="py-20 flex justify-center items-center">
      <Loader2 className="animate-spin text-loomra-red" size={32} />
    </div>
  );

  if (products.length === 0) return null;

  return (
    <section className="bg-loomra-white py-24">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-small uppercase tracking-[0.32em] text-loomra-red font-bold">New Arrivals</p>
            <h2 className="text-4xl font-black text-loomra-black tracking-tight mt-2 uppercase">Freshly Crafted <span className="text-loomra-red">.</span></h2>
            <p className="text-loomra-muted mt-2 max-w-md">The latest expressions of our craft, ready to join your wardrobe.</p>
          </div>
          <a
            href="/shop"
            className="text-xs font-black uppercase tracking-[2px] border-b-2 border-loomra-black pb-1 hover:text-loomra-red hover:border-loomra-red transition-all"
          >
            View Collection
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
