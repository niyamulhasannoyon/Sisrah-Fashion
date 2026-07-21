'use client';

import { motion } from 'framer-motion';
import { useCartStore } from '@/store/useCartStore';
import { ShoppingBag } from 'lucide-react';

interface MobileStickyCartProps {
  product: {
    _id: string;
    title: string;
    basePrice: number;
    offerPrice?: number;
    images?: { url: string }[];
  };
  selectedSize: string;
  setSelectedSize: (size: string) => void;
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  availableSizes: string[];
  availableColors: string[];
  disabled?: boolean;
  price: number;
  offerPrice: number;
  buttonText?: string;
}

export default function MobileStickyCart({
  product,
  selectedSize,
  selectedColor,
  setSelectedSize,
  setSelectedColor,
  availableSizes,
  availableColors,
  disabled,
  price,
  offerPrice,
  buttonText
}: MobileStickyCartProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const imageUrl = product.images?.[0]?.url ?? '/images/linen-shirt.jpg';

  const displayPrice = offerPrice > 0 && offerPrice < price ? offerPrice : price;
  const isDiscounted = offerPrice > 0 && offerPrice < price;

  const handleAddToCart = () => {
    addToCart({
      _id: product._id,
      title: product.title,
      price: displayPrice,
      image: imageUrl,
      selectedSize: selectedSize || 'M',
      selectedColor: selectedColor || 'Standard',
      availableSizes,
      availableColors
    });
  };

  return (
    <motion.div
      initial={{ y: 120 }}
      animate={{ y: 0 }}
      exit={{ y: 120 }}
      transition={{ type: 'spring', damping: 25, stiffness: 220 }}
      className="md:hidden fixed bottom-[calc(64px+env(safe-area-inset-bottom,0px))] left-0 w-full bg-white border-t border-gray-100 px-4 py-3.5 z-40 flex flex-col gap-3.5 shadow-[0_-12px_30px_rgba(0,0,0,0.08)]"
    >
      {/* Top Row: Price & Size Select */}
      <div className="flex justify-between items-center gap-4">
        {/* Price Display */}
        <div className="flex flex-col shrink-0">
          <span className="text-[10px] font-black uppercase tracking-[1.5px] text-gray-400">Price</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-base font-black text-[#A31F24]">৳ {displayPrice.toLocaleString()}</span>
            {isDiscounted && (
              <span className="text-xs text-gray-400 line-through font-medium">৳ {price.toLocaleString()}</span>
            )}
          </div>
        </div>

        {/* Horizontal Size Pills Selector */}
        <div className="flex flex-col items-end gap-1 overflow-hidden">
          <span className="text-[10px] font-black uppercase tracking-[1.5px] text-gray-400">Select Size</span>
          <div className="flex gap-1.5 overflow-x-auto max-w-full pb-0.5 shrink-0 select-none no-scrollbar">
            {availableSizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`w-8 h-8 flex items-center justify-center text-[11px] font-black rounded-lg border transition-all duration-200 shrink-0 ${
                  selectedSize === size
                    ? 'bg-black text-white border-black shadow-sm'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={disabled}
        className="w-full min-h-[48px] bg-[#A31F24] hover:bg-red-800 text-white text-xs font-black uppercase tracking-[2px] rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
      >
        <ShoppingBag size={15} />
        {buttonText || (disabled ? 'Select Size' : 'Add to Cart')}
      </button>
    </motion.div>
  );
}
