"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X, ShoppingBag } from 'lucide-react';

interface ProofItem {
  id: string;
  name: string;
  location: string;
  productTitle: string;
  productSlug: string;
  image: string;
  timeAgo: string;
}

const RECENT_ORDERS: ProofItem[] = [
  {
    id: '1',
    name: 'Tanvir A.',
    location: 'Mirpur, Dhaka',
    productTitle: 'Minimalist Premium Linen Shirt - White',
    productSlug: 'minimalist-linen-shirt-white',
    image: '/images/hero-model.jpg',
    timeAgo: '2 mins ago',
  },
  {
    id: '2',
    name: 'Rahim K.',
    location: 'Gulshan, Dhaka',
    productTitle: 'Heavyweight Premium Cotton T-Shirt - Black',
    productSlug: 'heavyweight-cotton-tshirt-black',
    image: '/images/hero-model.jpg',
    timeAgo: '5 mins ago',
  },
  {
    id: '3',
    name: 'Siam M.',
    location: 'Agrabad, Chattogram',
    productTitle: 'Executive Oxford Linen Shirt - Navy',
    productSlug: 'executive-oxford-shirt-navy',
    image: '/images/hero-model.jpg',
    timeAgo: '9 mins ago',
  },
  {
    id: '4',
    name: 'Shakil H.',
    location: 'Dhanmondi, Dhaka',
    productTitle: 'Organic Crewneck Oversized T-Shirt',
    productSlug: 'organic-crewneck-oversized-tshirt',
    image: '/images/hero-model.jpg',
    timeAgo: '14 mins ago',
  },
  {
    id: '5',
    name: 'Mahmudul R.',
    location: 'Zindabazar, Sylhet',
    productTitle: 'Structured Tailored Cotton Polo',
    productSlug: 'structured-tailored-cotton-polo',
    image: '/images/hero-model.jpg',
    timeAgo: '18 mins ago',
  },
];

export default function LiveSalesProof() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    // First appearance after 4 seconds
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 4000);

    return () => clearTimeout(initialTimer);
  }, [isDismissed]);

  useEffect(() => {
    if (isDismissed || !isVisible) return;

    // Hide after 6 seconds of display
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 6000);

    return () => clearTimeout(hideTimer);
  }, [isVisible, isDismissed]);

  useEffect(() => {
    if (isDismissed || isVisible) return;

    // Show next order notification every 14 seconds
    const nextTimer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % RECENT_ORDERS.length);
      setIsVisible(true);
    }, 14000);

    return () => clearTimeout(nextTimer);
  }, [isVisible, isDismissed]);

  if (isDismissed) return null;

  const currentOrder = RECENT_ORDERS[currentIndex];

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
          <div className="relative w-12 h-14 rounded-xl overflow-hidden shrink-0 bg-stone-800 border border-stone-700">
            <Image
              src={currentOrder.image}
              alt={currentOrder.productTitle}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
              <CheckCircle2 size={13} className="shrink-0" />
              <span>Verified Order from {currentOrder.location}</span>
            </div>
            <Link
              href={`/product/${currentOrder.productSlug}`}
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
