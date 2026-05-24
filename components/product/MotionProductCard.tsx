'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';

interface MotionProductCardProps {
  product: {
    _id: string;
    title: string;
    slug: string;
    category: string;
    basePrice?: number;
    price?: number;
    offerPrice?: number;
    images?: { url: string }[];
    variants?: any[];
  };
}

export default function MotionProductCard({ product }: MotionProductCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);

  const primaryImage = product.images?.[0]?.url ?? '/images/linen-shirt.jpg';
  const hoverImage = product.images?.[1]?.url ?? primaryImage;
  const displayPrice = product.offerPrice && product.offerPrice > 0 && product.offerPrice < (product.basePrice ?? 0)
    ? product.offerPrice
    : (product.price ?? product.basePrice ?? 0);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();

    const defaultSize = product.variants?.[0]?.size || 'M';
    const defaultColor = product.variants?.[0]?.color || 'Standard';

    addToCart({
      _id: product._id,
      title: product.title,
      price: displayPrice,
      image: primaryImage,
      selectedSize: defaultSize,
      selectedColor: defaultColor,
    });
  };

  return (
    <Link href={`/product/${product.slug}`} className="group flex flex-col gap-4 cursor-pointer overflow-hidden rounded-none border border-loomra-surface bg-loomra-white transition-colors hover:border-loomra-red">
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
          className="absolute bottom-0 left-0 w-full p-4"
          initial={{ y: '100%' }}
          whileHover={{ y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <button 
            onClick={handleQuickAdd}
            className="w-full bg-white/95 backdrop-blur-sm text-loomra-black py-2 text-xs font-bold uppercase hover:bg-loomra-red hover:text-white transition-colors shadow-sm rounded-[4px]"
          >
            Quick Add
          </button>
        </motion.div>
      </div>

      <div className="flex flex-col gap-2 p-4">
        <p className="text-[10px] uppercase tracking-[0.24em] text-loomra-muted">{product.category}</p>
        <h3 className="text-sm font-medium text-loomra-black truncate">{product.title}</h3>
        <p className="text-sm font-bold text-loomra-red">৳ {displayPrice.toLocaleString()}</p>
      </div>
    </Link>
  );
}
