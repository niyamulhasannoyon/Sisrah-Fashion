'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';

export default function ProductCard({ product }: { product: any }) {
  const addToCart = useCartStore((state) => state.addToCart);
  const { wishlist, toggleWishlist } = useWishlistStore();
  const isLiked = wishlist.some((p: any) => p._id === product._id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();

    const defaultSize = product.variants?.[0]?.size || 'M';
    const defaultColor = product.variants?.[0]?.color || 'Standard';

    const price = product.offerPrice > 0 ? product.offerPrice : product.basePrice;
    
    addToCart({
      _id: product._id,
      title: product.title,
      price: price,
      image: product.images[0]?.url || '/placeholder.jpg',
      selectedSize: defaultSize,
      selectedColor: defaultColor,
    });
  };

  return (
    <div className="group flex flex-col gap-3 cursor-pointer">
      <Link href={`/product/${product.slug}`} className="relative aspect-[4/5] bg-[#F9F9F9] rounded-xl overflow-hidden border border-gray-100">
        <img 
          src={product.images[0]?.url || '/placeholder.jpg'} 
          alt={product.title} 
          className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" 
        />

        <button 
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-transform z-10"
        >
          <Heart size={16} fill={isLiked ? "#A31F24" : "none"} color={isLiked ? "#A31F24" : "#1A1A1A"} />
        </button>
        
        <div className="absolute bottom-0 left-0 w-full p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button 
            onClick={handleQuickAdd}
            className="w-full bg-white/95 backdrop-blur text-black py-2.5 text-[11px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors shadow-lg rounded-lg"
          >
            Quick Add
          </button>
        </div>
      </Link>

      <Link href={`/product/${product.slug}`} className="flex flex-col gap-1 px-1">
        <span className="text-[10px] font-black uppercase tracking-[2px] text-gray-400">{product.category}</span>
        <h3 className="text-sm font-bold text-[#1A1A1A] line-clamp-1">{product.title}</h3>
        <div className="flex items-center gap-2 mt-0.5">
          {product.offerPrice > 0 && product.offerPrice < product.basePrice ? (
            <>
              <span className="text-sm font-black text-[#A31F24]">৳ {product.offerPrice.toLocaleString()}</span>
              <span className="text-xs font-medium text-gray-400 line-through">৳ {product.basePrice.toLocaleString()}</span>
            </>
          ) : (
            <span className="text-sm font-bold text-[#1A1A1A]">৳ {product.basePrice.toLocaleString()}</span>
          )}
        </div>
      </Link>
    </div>
  );
}
