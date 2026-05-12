'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/product/ProductCard';
import { Loader2 } from 'lucide-react';

export function TrendingSlider() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products/trending')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProducts(data.products);
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
    <section className="bg-loomra-white py-24 border-t border-slate-100">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-small uppercase tracking-[0.32em] text-loomra-red font-bold">Curated Edit</p>
            <h2 className="text-4xl font-black text-loomra-black tracking-tight mt-2 uppercase">Trending Now <span className="text-loomra-red">.</span></h2>
            <p className="text-loomra-muted mt-2 max-w-md">Our most-loved pieces, curated for your contemporary lifestyle.</p>
          </div>
          <a
            href="/shop"
            className="text-xs font-black uppercase tracking-[2px] border-b-2 border-loomra-black pb-1 hover:text-loomra-red hover:border-loomra-red transition-all"
          >
            Explore All
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
