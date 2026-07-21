'use client';

import { useWishlistStore } from '@/store/useWishlistStore';
import { useCartStore } from '@/store/useCartStore';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useLockedBody } from '@/lib/useLockedBody';
import { formatCurrency } from '@/lib/utils';
import { useCallback, useState, useEffect } from 'react';

/**
 * Mobile-optimized Wishlist Drawer
 * - Compact layout to view favorited items
 * - Quick add to cart action
 * - Smooth transition overlay
 */
export default function WishlistDrawer() {
  const { wishlist, isWishlistOpen, toggleWishlistDrawer, toggleWishlist } = useWishlistStore();
  const addToCart = useCartStore((state) => state.addToCart);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLockedBody(isWishlistOpen);

  const handleQuickAdd = useCallback((product: any) => {
    const defaultVariant = product.variants?.[0];
    addToCart({
      _id: product._id,
      title: product.title,
      price: product.offerPrice > 0 ? product.offerPrice : product.basePrice,
      image: product.images?.[0]?.url || product.image,
      selectedSize: defaultVariant?.size || 'M',
      selectedColor: defaultVariant?.color || 'Standard',
      availableSizes: Array.from(new Set(product.variants?.map((v: any) => v.size) || [])) as string[],
      availableColors: Array.from(new Set(product.variants?.map((v: any) => v.color) || [])) as string[],
    });
    // Toggle cart open to show addition
    useCartStore.setState({ isCartOpen: true });
    // Close wishlist
    toggleWishlistDrawer();
  }, [addToCart, toggleWishlistDrawer]);

  return (
    <>
      {/* Backdrop */}
      {isWishlistOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] transition-opacity duration-300"
          onClick={toggleWishlistDrawer}
        />
      )}

      {/* Drawer panel */}
      <div
        className={`fixed inset-y-0 right-0 h-screen w-full sm:w-[440px] bg-white shadow-2xl z-[210] transform transition-all duration-500 ease-out flex flex-col ${
          isWishlistOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* ====== HEADER ====== */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-white shrink-0">
          <h2 className="text-base font-black uppercase tracking-widest text-[#1A1A1A] flex items-center gap-3">
            <Heart size={18} className="text-loomra-red fill-current" />
            Wishlist{' '}
            <span className="bg-loomra-red text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
              {mounted ? wishlist.length : 0}
            </span>
          </h2>
          <button
            onClick={toggleWishlistDrawer}
            aria-label="Close Wishlist"
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-gray-100 rounded-xl transition-colors active:scale-95"
          >
            <X size={18} className="text-[#1A1A1A]" />
          </button>
        </div>

        {/* ====== SCROLLABLE ITEMS ====== */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#FAFAFA]">
          <div className="p-4 flex flex-col gap-3">
            {!mounted || wishlist.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-5">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                  <Heart size={36} strokeWidth={1} className="opacity-60" />
                </div>
                <p className="text-sm font-bold uppercase tracking-widest text-center">Your wishlist is empty</p>
                <button
                  onClick={toggleWishlistDrawer}
                  className="text-xs font-black uppercase tracking-widest border-b-2 border-black pb-1 text-black hover:text-loomra-red hover:border-loomra-red transition-all"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              wishlist.map((item) => {
                const displayPrice = item.offerPrice > 0 ? item.offerPrice : item.basePrice;
                const imageUrl = item.images?.[0]?.url || item.image || '/placeholder.jpg';
                return (
                  <div
                    key={item._id}
                    className="flex gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="relative w-20 h-24 bg-[#F5F5F5] rounded-xl overflow-hidden shrink-0 border border-gray-50">
                      <Image
                        src={imageUrl}
                        alt={item.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      {/* Title + Delete */}
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-sm font-bold text-[#1A1A1A] truncate pr-1">{item.title}</h3>
                        <button
                          onClick={() => toggleWishlist(item)}
                          aria-label="Remove from Wishlist"
                          className="p-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-red-50 rounded-lg text-gray-300 hover:text-red-500 transition-all shrink-0 active:scale-90"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Price + Add to Cart */}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-black text-[#A31F24]">
                          ৳ {displayPrice.toLocaleString()}
                        </span>

                        <button
                          onClick={() => handleQuickAdd(item)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-loomra-red transition-colors active:scale-95 shrink-0"
                        >
                          <ShoppingBag size={12} />
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}
