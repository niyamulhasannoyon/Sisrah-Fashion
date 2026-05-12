'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface Hotspot {
  id: string;
  x: number; // percentage from left
  y: number; // percentage from top
  productName: string;
  price: string;
}

export default function ShopTheLook() {
  const [activeSpot, setActiveSpot] = useState<string | null>(null);

  const hotspots: Hotspot[] = [
    { id: '1', x: 45, y: 30, productName: "Linen Camp Collar Shirt", price: "৳ 2,490" },
    { id: '2', x: 50, y: 70, productName: "Pleated Chino Trousers", price: "৳ 1,890" },
  ];

  return (
    <section className="container mx-auto py-64px">
      <h2 className="text-heading font-bold mb-40px text-center">Shop the Look</h2>
      
      <div className="relative max-w-2xl mx-auto">
        <img src="/images/lifestyle-outfit.jpg" alt="Summer Outfit" className="w-full h-auto object-cover" />

        {hotspots.map((spot) => (
          <div 
            key={spot.id}
            className="absolute group"
            style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
            onMouseEnter={() => setActiveSpot(spot.id)}
            onMouseLeave={() => setActiveSpot(null)}
          >
            {/* Pulsing Dot */}
            <div className="relative flex items-center justify-center w-8 h-8 cursor-pointer -translate-x-1/2 -translate-y-1/2">
              <span className="absolute inline-flex w-full h-full rounded-full bg-white opacity-75 animate-ping"></span>
              <span className="relative inline-flex rounded-full w-3 h-3 bg-loomra-black"></span>
            </div>

            {/* Product Tooltip Card */}
            {activeSpot === spot.id && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="absolute z-10 w-48 bg-white p-12px shadow-xl border border-loomra-surface left-1/2 -translate-x-1/2 mt-8px"
              >
                <p className="text-[12px] font-bold text-loomra-black leading-tight mb-4px">{spot.productName}</p>
                <p className="text-[12px] text-loomra-red font-bold mb-8px">{spot.price}</p>
                <button className="w-full bg-loomra-black text-white text-[10px] uppercase py-4px hover:bg-loomra-red transition">View Product</button>
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
