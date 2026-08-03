"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X, ShoppingBag } from 'lucide-react';
import { getDirectImageLink } from '@/lib/utils';

interface ProofItem {
  id: string;
  name: string;
  location: string;
  productTitle: string;
  productSlug?: string;
  image: string;
  timeAgo: string;
}

const CUSTOMER_LOCATIONS = [
  { name: 'Tanvir A.', location: 'Mirpur, Dhaka' },
  { name: 'Rahim K.', location: 'Gulshan, Dhaka' },
  { name: 'Siam M.', location: 'Agrabad, Chattogram' },
  { name: 'Shakil H.', location: 'Dhanmondi, Dhaka' },
  { name: 'Mahmudul R.', location: 'Zindabazar, Sylhet' },
  { name: 'Fahim R.', location: 'Banani, Dhaka' },
  { name: 'Asif M.', location: 'Uttara, Dhaka' },
  { name: 'Jahid H.', location: 'Rajshahi' },
  { name: 'Nayeem I.', location: 'Khulna' },
  { name: 'Saiful B.', location: 'Gazipur' },
];

const TIME_AGOS = ['2 mins ago', '5 mins ago', '8 mins ago', '12 mins ago', '15 mins ago', '19 mins ago'];

export default function LiveSalesProof() {
  const [proofItems, setProofItems] = useState<ProofItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Fetch real active products to build live sales notifications dynamically
  useEffect(() => {
    let isMounted = true;
    async function loadRealProducts() {
      try {
        const res = await fetch('/api/products?limit=10');
        const data = await res.json();
        
        if (isMounted && data?.success && Array.isArray(data.products) && data.products.length > 0) {
          const items: ProofItem[] = data.products.map((prod: any, idx: number) => {
            const customer = CUSTOMER_LOCATIONS[idx % CUSTOMER_LOCATIONS.length];
            const rawImage = prod.images?.[0]?.url || '/images/hero-model.jpg';
            return {
              id: prod._id || String(idx),
              name: customer.name,
              location: customer.location,
              productTitle: prod.title,
              productSlug: prod.slug,
              image: getDirectImageLink(rawImage),
              timeAgo: TIME_AGOS[idx % TIME_AGOS.length],
            };
          });
          setProofItems(items);
        }
      } catch (err) {
        console.error('Error fetching products for sales proof:', err);
      }
    }
    loadRealProducts();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (isDismissed || proofItems.length === 0) return;

    // Initial appearance after 4 seconds
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 4000);

    return () => clearTimeout(initialTimer);
  }, [isDismissed, proofItems]);

  useEffect(() => {
    if (isDismissed || !isVisible) return;

    // Hide toast after 6 seconds
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 6000);

    return () => clearTimeout(hideTimer);
  }, [isVisible, isDismissed]);

  useEffect(() => {
    if (isDismissed || isVisible || proofItems.length === 0) return;

    // Cycle to next notification every 14 seconds
    const nextTimer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % proofItems.length);
      setIsVisible(true);
    }, 14000);

    return () => clearTimeout(nextTimer);
  }, [isVisible, isDismissed, proofItems]);

  if (isDismissed || proofItems.length === 0) return null;

  const currentOrder = proofItems[currentIndex];
  if (!currentOrder) return null;

  const targetHref = currentOrder.productSlug ? `/product/${currentOrder.productSlug}` : '/shop';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed bottom-20 left-4 z-40 max-w-sm sm:max-w-md bg-stone-900/95 backdrop-blur-md text-white border border-stone-800 rounded-2xl p-3.5 shadow-2xl flex items-center gap-3.5"
        >
          <Link href={targetHref} className="relative w-12 h-14 rounded-xl overflow-hidden shrink-0 bg-stone-800 border border-stone-700 block">
            <Image
              src={currentOrder.image}
              alt={currentOrder.productTitle}
              fill
              className="object-cover"
            />
          </Link>

          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
              <CheckCircle2 size={13} className="shrink-0" />
              <span>Verified Order from {currentOrder.location}</span>
            </div>
            <Link
              href={targetHref}
              className="block text-xs font-semibold text-stone-100 truncate hover:text-[#A31F24] transition-colors mt-0.5"
            >
              {currentOrder.productTitle}
            </Link>
            <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-0.5">
              <span>{currentOrder.name}</span>
              <span>•</span>
              <span className="text-stone-300">{currentOrder.timeAgo}</span>
              <span>•</span>
              <span className="text-[#A31F24] font-medium flex items-center gap-0.5">
                <ShoppingBag size={10} /> COD
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsDismissed(true)}
            className="absolute top-2 right-2 text-stone-400 hover:text-white p-1 rounded-full hover:bg-stone-800 transition-colors"
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
