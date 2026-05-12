'use client';

import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

interface MobileStickyCartProps {
  product: {
    _id: string;
    title: string;
    basePrice: number;
    images?: { url: string }[];
  };
  selectedSize: string;
  selectedColor: string;
  disabled?: boolean;
}

export default function MobileStickyCart({ product, selectedSize, selectedColor, disabled }: MobileStickyCartProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const imageUrl = product.images?.[0]?.url ?? '/images/linen-shirt.jpg';

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="md:hidden fixed bottom-[64px] left-0 w-full bg-loomra-white border-t border-loomra-surface px-16px py-16px z-40 flex gap-16px shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
    >
      <button className="min-w-[48px] min-h-[48px] border border-loomra-surface text-loomra-black flex items-center justify-center active:bg-loomra-surface transition-colors">
        <Heart size={20} strokeWidth={1.5} />
      </button>

      <button
        onClick={() => addToCart({
          _id: product._id,
          title: product.title,
          price: product.basePrice,
          image: imageUrl,
          selectedSize,
          selectedColor
        })}
        disabled={disabled}
        className="flex-1 min-h-[48px] bg-loomra-red text-loomra-white text-small font-bold uppercase tracking-widest active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center"
      >
        {disabled ? 'Select Size' : 'Add to Cart'}
      </button>
    </motion.div>
  );
}
