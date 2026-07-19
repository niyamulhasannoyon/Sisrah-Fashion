'use client';

import Link from 'next/link';
import { Heart, Star } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import ProductImage from '@/components/ui/ProductImage';

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
      <Link href={`/product/${product.slug}`} className="relative block rounded-xl overflow-hidden border border-gray-100">
        <ProductImage
          src={product.images[0]?.url || ''}
          alt={product.title}
          aspectRatio="portrait"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 288px"
          className="rounded-none"
        />

        <button 
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-transform z-10"
        >
          <Heart size={16} fill={isLiked ? "#A31F24" : "none"} color={isLiked ? "#A31F24" : "#1A1A1A"} />
        </button>
        
        <div className="absolute bottom-0 left-0 w-full p-3 translate-y-0 md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-300">
          <button 
            onClick={handleQuickAdd}
            className="w-full bg-white/95 backdrop-blur text-black py-2.5 text-[11px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors shadow-lg rounded-lg"
          >
            Quick Add
          </button>
        </div>      </Link>

      <Link href={`/product/${product.slug}`} className="flex flex-col gap-1 px-1">
        <span className="text-[10px] font-black uppercase tracking-[2px] text-gray-400">{product.category}</span>
        {/* Star Rating */}
        <div className="flex items-center gap-1 my-0.5">
          <div className="flex text-amber-400 gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star 
                key={i} 
                size={11} 
                fill={i < Math.round(product.rating || 0) ? 'currentColor' : 'none'} 
                className={i < Math.round(product.rating || 0) ? 'text-amber-400' : 'text-slate-200'}
              />
            ))}
          </div>
          {product.numReviews > 0 && (
            <span className="text-[9px] text-slate-400 font-bold ml-0.5">({product.numReviews})</span>
          )}
        </div>
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
