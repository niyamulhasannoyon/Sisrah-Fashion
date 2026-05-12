'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface MotionProductCardProps {
  product: {
    title: string;
    slug: string;
    category: string;
    basePrice?: number;
    price?: number;
    images?: { url: string }[];
  };
}

export default function MotionProductCard({ product }: MotionProductCardProps) {
  const primaryImage = product.images?.[0]?.url ?? '/images/linen-shirt.jpg';
  const hoverImage = product.images?.[1]?.url ?? primaryImage;
  const displayPrice = product.price ?? product.basePrice ?? 0;

  return (
    <Link href={`/product/${product.slug}`} className="group flex flex-col gap-16px cursor-pointer overflow-hidden rounded-none border border-loomra-surface bg-loomra-white transition-colors hover:border-loomra-red">
      <div className="relative aspect-[3/4] bg-loomra-surface overflow-hidden">
        <motion.img
          src={primaryImage}
          alt={product.title}
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 1, scale: 1 }}
          whileHover={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />

        <motion.img
          src={hoverImage}
          alt={`${product.title} view`}
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.05 }}
          whileHover={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />

        <motion.div
          className="absolute bottom-0 left-0 w-full p-16px"
          initial={{ y: '100%' }}
          whileHover={{ y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <button className="w-full bg-loomra-white/90 backdrop-blur-sm text-loomra-black py-8px text-small font-bold uppercase hover:bg-loomra-red hover:text-loomra-white transition-colors shadow-sm">
            Quick Add
          </button>
        </motion.div>
      </div>

      <div className="flex flex-col gap-8px p-6">
        <p className="text-xs uppercase tracking-[0.24em] text-loomra-muted">{product.category}</p>
        <h3 className="text-lg font-medium text-loomra-black truncate">{product.title}</h3>
        <p className="text-price font-bold text-loomra-red">৳ {displayPrice.toLocaleString()}</p>
      </div>
    </Link>
  );
}
