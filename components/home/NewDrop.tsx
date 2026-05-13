'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/product/ProductCard';
import { Loader2 } from 'lucide-react';

export function NewDrop() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products/latest')
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
        console.error("Error fetching latest products:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="py-20 flex justify-center items-center">
      <Loader2 className="animate-spin text-loomra-red" size={32} />
    </div>
  );

  if (products.length === 0) return null;

  return (
    <section className="bg-[#FBFBFB] py-24 border-y border-gray-100 overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12">
          <div>
            <p className="text-small uppercase tracking-[0.32em] text-loomra-red font-bold">New Drop</p>
            <h2 className="text-4xl font-black uppercase tracking-tight text-[#1A1A1A] mt-2">
              Scroll through the latest edit <span className="text-loomra-red">.</span>
            </h2>
          </div>
          <div className="hidden md:flex items-center gap-3 text-xs font-black uppercase tracking-[2px] text-loomra-muted">
            <span>Swipe for more</span>
            <span className="text-loomra-black text-lg">→</span>
          </div>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="flex overflow-x-auto gap-6 pb-10 snap-x custom-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
          {products.map((product: any) => (
            <div key={product._id} className="min-w-[280px] md:min-w-[320px] snap-start shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
