'use client';

import { useCartStore } from '@/store/useCartStore';
import { X, Plus, Minus, Trash2, ShoppingBag, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useCallback } from 'react';

/**
 * Mobile-optimized Cart Drawer
 * - Compact card layout without horizontal scrolling
 * - Sticky bottom checkout bar with total
 * - Optimistic UI updates for quantity/remove
 */
export default function CartDrawer() {
  const { cart, isCartOpen, toggleCart, removeFromCart, updateQuantity, updateItemVariant, getCartTotal } = useCartStore();
  const [recommended, setRecommended] = useState<any[]>([]);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Fetch recommended products when cart opens
  useEffect(() => {
    if (isCartOpen) {
      fetch('/api/products/latest')
        .then(res => res.json())
        .then(data => {
          if (data.success) setRecommended(data.products.slice(0, 4));
        });
    }
  }, [isCartOpen]);

  const handleQuickAdd = (product: any) => {
    const defaultVariant = product.variants?.[0];
    useCartStore.getState().addToCart({
      _id: product._id,
      title: product.title,
      price: product.offerPrice > 0 ? product.offerPrice : product.basePrice,
      image: product.images[0]?.url,
      selectedSize: defaultVariant?.size || 'M',
      selectedColor: defaultVariant?.color || 'Standard',
      availableSizes: Array.from(new Set(product.variants?.map((v: any) => v.size))) as string[],
      availableColors: Array.from(new Set(product.variants?.map((v: any) => v.color))) as string[],
    });
  };

  const handleRemove = useCallback((id: string, size: string, color: string) => {
    setRemovingId(`${id}-${size}-${color}`);
    // Optimistic: slight delay then remove
    setTimeout(() => {
      removeFromCart(id, size, color);
      setRemovingId(null);
    }, 300);
  }, [removeFromCart]);

  const handleQuantityChange = useCallback((id: string, size: string, color: string, qty: number) => {
    if (qty < 1) return;
    // Optimistic update — immediately reflected via Zustand
    updateQuantity(id, size, color, qty);
  }, [updateQuantity]);

  return (
    <>
      {/* Backdrop */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={toggleCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[440px] bg-white shadow-2xl z-50 transform transition-all duration-500 ease-out flex flex-col ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* ====== HEADER ====== */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-white shrink-0">
          <h2 className="text-base font-black uppercase tracking-widest text-[#1A1A1A] flex items-center gap-3">
            <ShoppingBag size={18} />
            Cart{' '}
            <span className="bg-[#A31F24] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
              {cart.length}
            </span>
          </h2>
          <button
            onClick={toggleCart}
            aria-label="Close"
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors active:scale-95"
          >
            <X size={18} className="text-[#1A1A1A]" />
          </button>
        </div>

        {/* ====== SCROLLABLE ITEMS ====== */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#FAFAFA]">
          <div className="p-4 flex flex-col gap-3">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-5">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                  <ShoppingBag size={36} strokeWidth={1} className="opacity-60" />
                </div>
                <p className="text-sm font-bold uppercase tracking-widest">Your cart is empty</p>
                <button
                  onClick={toggleCart}
                  className="text-xs font-black uppercase tracking-widest border-b-2 border-black pb-1 text-black hover:text-[#A31F24] hover:border-[#A31F24] transition-all"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item, index) => {
                const itemKey = `${item._id}-${item.selectedSize}-${item.selectedColor}`;
                const isRemoving = removingId === itemKey;
                return (
                  <div
                    key={itemKey}
                    className={`flex gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative transition-all duration-300 ${
                      isRemoving ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                    }`}
                  >
                    {/* Image */}
                    <div className="relative w-20 h-24 bg-[#F5F5F5] rounded-xl overflow-hidden shrink-0 border border-gray-50">
                      <Image
                        src={item.image || '/placeholder.jpg'}
                        alt={item.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      {/* Title + Remove */}
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-sm font-bold text-[#1A1A1A] truncate pr-1">{item.title}</h3>
                        <button
                          onClick={() => handleRemove(item._id, item.selectedSize, item.selectedColor)}
                          aria-label="Remove"
                          className="p-1.5 hover:bg-red-50 rounded-lg text-gray-300 hover:text-red-500 transition-all shrink-0 active:scale-90"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Variant Info */}
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 truncate">
                        {item.selectedSize} / {item.selectedColor}
                      </p>

                      {/* Price + Quantity */}
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-black text-[#A31F24]">
                          ৳ {item.price.toLocaleString()}
                        </span>

                        {/* Quantity Toggle */}
                        <div className="flex items-center border border-gray-200 rounded-xl bg-white overflow-hidden">
                          <button
                            onClick={() => handleQuantityChange(item._id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                            aria-label="Decrease"
                            className="p-2 hover:bg-gray-50 text-gray-500 transition-colors active:bg-gray-100"
                          >
                            <Minus size={12} strokeWidth={3} />
                          </button>
                          <span className="w-8 text-center text-xs font-black text-[#1A1A1A] select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item._id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                            aria-label="Increase"
                            className="p-2 hover:bg-gray-50 text-gray-500 transition-colors active:bg-gray-100"
                          >
                            <Plus size={12} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ====== CROSS-SELL ====== */}
          {cart.length > 0 && recommended.length > 0 && (
            <div className="px-5 pb-10 pt-2 border-t border-dashed border-gray-200 mt-2">
              <h3 className="text-[10px] font-black uppercase tracking-[2px] text-gray-400 mb-4 mt-4">
                Complete Your Look
              </h3>
              <div className="flex overflow-x-auto gap-3 custom-scrollbar snap-x pb-2 -mx-1 px-1">
                {recommended.map((product) => (
                  <div
                    key={product._id}
                    className="w-[150px] shrink-0 snap-center bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden mb-3 bg-[#F5F5F5]">
                      <Image
                        src={product.images[0]?.url || '/placeholder.jpg'}
                        alt={product.title}
                        fill
                        sizes="150px"
                        className="object-cover"
                        loading="lazy"
                      />
                    </div>
                    <h4 className="text-[11px] font-bold text-gray-800 truncate">{product.title}</h4>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs font-black text-[#A31F24]">
                        ৳ {(product.offerPrice || product.basePrice).toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleQuickAdd(product)}
                        aria-label="Quick add"
                        className="w-7 h-7 bg-black text-white rounded-lg flex items-center justify-center hover:bg-[#A31F24] transition-colors shadow-lg active:scale-90"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ====== STICKY BOTTOM CHECKOUT BAR ====== */}
        {cart.length > 0 && (
          <div className="border-t border-gray-100 bg-white/95 backdrop-blur-md shrink-0 shadow-[0_-12px_40px_rgba(0,0,0,0.06)] sticky bottom-0">
            <div className="px-5 pt-4 pb-5">
              {/* Total */}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[2px] text-gray-400 block">
                    Subtotal
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">
                    Shipping & taxes at checkout
                  </span>
                </div>
                <span className="text-2xl font-black text-[#1A1A1A]">
                  ৳ {getCartTotal().toLocaleString()}
                </span>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                onClick={toggleCart}
                className="w-full bg-black text-white py-4 text-xs font-black uppercase tracking-[3px] hover:bg-[#A31F24] transition-all rounded-2xl flex items-center justify-center gap-3 shadow-xl hover:shadow-red-900/20 active:scale-[0.98]"
              >
                Proceed to Checkout
                <ShieldCheck size={16} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
