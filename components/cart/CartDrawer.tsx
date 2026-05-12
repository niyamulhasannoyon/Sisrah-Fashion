'use client';

import { useCartStore } from '@/store/useCartStore';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CartDrawer() {
  const { cart, isCartOpen, toggleCart, removeFromCart, updateQuantity, updateItemVariant, getCartTotal } = useCartStore();
  const [recommended, setRecommended] = useState<any[]>([]);

  // Fetch recommended products when cart opens
  useEffect(() => {
    if (isCartOpen) {
      fetch('/api/products/latest')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            // Show up to 4 products
            setRecommended(data.products.slice(0, 4));
          }
        });
    }
  }, [isCartOpen]);

  // Quick Add function for recommended items
  const handleQuickAdd = (product: any) => {
    const defaultVariant = product.variants?.[0];
    useCartStore.getState().addToCart({
      _id: product._id,
      title: product.title,
      price: product.offerPrice > 0 ? product.offerPrice : product.basePrice,
      image: product.images[0]?.url,
      selectedSize: defaultVariant?.size || 'M',
      selectedColor: defaultVariant?.color || 'Standard',
      availableSizes: Array.from(new Set(product.variants?.map((v:any) => v.size))) as string[],
      availableColors: Array.from(new Set(product.variants?.map((v:any) => v.color))) as string[],
    });
  };

  return (
    <>
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={toggleCart} />
      )}

      <div className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 transform transition-transform duration-500 ease-in-out flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white shrink-0">
          <h2 className="text-lg font-black uppercase tracking-widest text-[#1A1A1A] flex items-center gap-2">
            <ShoppingBag size={20} /> Your Cart <span className="bg-[#A31F24] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full ml-1">{cart.length}</span>
          </h2>
          <button onClick={toggleCart} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-[#1A1A1A]" />
          </button>
        </div>

        {/* Scrollable Area (Cart Items + Recommended) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#FBFBFB]">
          
          {/* Cart Items */}
          <div className="p-6 flex flex-col gap-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
                <ShoppingBag size={48} strokeWidth={1} className="opacity-50" />
                <p className="text-sm font-bold uppercase tracking-widest">Your cart is empty</p>
                <button onClick={toggleCart} className="mt-2 text-xs font-black uppercase tracking-widest border-b-2 border-black pb-1 text-black hover:text-[#A31F24] hover:border-[#A31F24] transition-all">Start Shopping</button>
              </div>
            ) : (
              cart.map((item, index) => (
                <div key={index} className="flex gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm relative group">
                  {/* Delete Button (Hover) */}
                  <button onClick={() => removeFromCart(item._id, item.selectedSize, item.selectedColor)} className="absolute top-2 right-2 p-1.5 bg-white shadow rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all z-10">
                    <Trash2 size={14} />
                  </button>

                  <div className="w-20 h-24 bg-[#F9F9F9] rounded-xl overflow-hidden shrink-0 border border-gray-50">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <h3 className="text-sm font-bold text-[#1A1A1A] line-clamp-1 pr-6">{item.title}</h3>
                      
                      {/* Editable Size & Color Dropdowns */}
                      <div className="flex gap-2 mt-2">
                        <select 
                          value={item.selectedSize}
                          onChange={(e) => updateItemVariant(item._id, item.selectedSize, item.selectedColor, e.target.value, item.selectedColor)}
                          className="text-[10px] font-black uppercase text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 outline-none cursor-pointer hover:border-black transition-colors"
                        >
                          {(item.availableSizes || [item.selectedSize]).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select 
                          value={item.selectedColor}
                          onChange={(e) => updateItemVariant(item._id, item.selectedSize, item.selectedColor, item.selectedSize, e.target.value)}
                          className="text-[10px] font-black uppercase text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 outline-none cursor-pointer hover:border-black transition-colors"
                        >
                          {(item.availableColors || [item.selectedColor]).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm font-black text-[#A31F24]">৳ {item.price.toLocaleString()}</span>
                      <div className="flex items-center border border-gray-200 rounded-xl bg-white overflow-hidden">
                        <button onClick={() => updateQuantity(item._id, item.selectedSize, item.selectedColor, item.quantity - 1)} className="p-2 hover:bg-gray-100 text-gray-500 transition-colors"><Minus size={12} strokeWidth={3} /></button>
                        <span className="w-8 text-center text-xs font-black text-[#1A1A1A]">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id, item.selectedSize, item.selectedColor, item.quantity + 1)} className="p-2 hover:bg-gray-100 text-gray-500 transition-colors"><Plus size={12} strokeWidth={3} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cross-Sell Section (You Might Also Like) */}
          {cart.length > 0 && recommended.length > 0 && (
            <div className="px-6 pb-10 pt-4 border-t border-dashed border-gray-200 mt-4">
              <h3 className="text-[10px] font-black uppercase tracking-[2px] text-gray-400 mb-6">Complete Your Look</h3>
              <div className="flex overflow-x-auto gap-4 custom-scrollbar snap-x pb-4">
                {recommended.map(product => (
                  <div key={product._id} className="w-[160px] shrink-0 snap-center bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden mb-3 bg-[#F9F9F9]">
                      <img src={product.images[0]?.url} className="absolute inset-0 w-full h-full object-cover" alt={product.title}/>
                    </div>
                    <h4 className="text-[11px] font-bold text-gray-800 line-clamp-1">{product.title}</h4>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs font-black text-[#A31F24]">৳ {(product.offerPrice || product.basePrice).toLocaleString()}</span>
                      <button onClick={() => handleQuickAdd(product)} className="w-7 h-7 bg-black text-white rounded-lg flex items-center justify-center hover:bg-[#A31F24] transition-colors shadow-lg"><Plus size={16}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer / Checkout Button */}
        {cart.length > 0 && (
          <div className="border-t border-gray-100 p-8 bg-white shrink-0 shadow-[0_-15px_40px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-end mb-8">
              <div>
                 <span className="text-[10px] font-black uppercase tracking-[2px] text-gray-400 block mb-2">Subtotal</span>
                 <span className="text-[10px] text-gray-400 font-medium">Shipping & taxes calculated at checkout</span>
              </div>
              <span className="text-3xl font-black text-[#1A1A1A]">৳ {getCartTotal().toLocaleString()}</span>
            </div>
            <Link href="/checkout" onClick={toggleCart} className="w-full bg-black text-white py-5 text-xs font-black uppercase tracking-[3px] hover:bg-[#A31F24] transition-all rounded-2xl flex justify-center items-center shadow-xl hover:shadow-red-900/20 active:scale-[0.98]">
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
