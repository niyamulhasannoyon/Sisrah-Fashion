'use client';

import ProductImage from '../ui/ProductImage';
import ColorSwatch from '../ui/ColorSwatch';
import Button from '../ui/Button';
import { useCartStore } from '@/store/useCartStore';

export default function RefinedProductCard({ product }: { product: any }) {
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultSize = product.variants?.[0]?.size || 'M';
    const defaultColor = product.variants?.[0]?.color || 'Standard';
    const finalPrice = product.offerPrice && product.offerPrice > 0 ? product.offerPrice : product.price || product.basePrice || 0;

    addToCart({
      _id: product._id,
      title: product.title,
      price: finalPrice,
      image: product.images?.[0]?.url || '/placeholder.jpg',
      selectedSize: defaultSize,
      selectedColor: defaultColor,
    });
  };

  return (
    <div className="flex flex-col gap-16px cursor-pointer group">
      
      {/* 1:1 Image Component */}
      <ProductImage 
        src={product.images?.[0]?.url || '/placeholder.jpg'} 
        alt={product.title} 
        hoverSrc={product.images?.[1]?.url} 
      />

      <div className="flex flex-col gap-8px px-4px">
        {/* Title & Price */}
        <div className="flex justify-between items-start">
           <h3 className="text-body font-medium text-[#1A1A1A] truncate pr-8px">{product.title}</h3>
           <p className="text-body font-bold text-[#A31F24] whitespace-nowrap">৳ {product.offerPrice || product.price || product.basePrice}</p>
        </div>

        {/* Swatches */}
        {product.availableColors && Array.isArray(product.availableColors) && (
          <div className="flex gap-8px mt-4px">
            {product.availableColors.map((color: any) => (
               <ColorSwatch 
                 key={color.name || color}
                 colorHex={color.hex || '#000000'}
                 colorName={color.name || color}
                 isSelected={false}
                 onClick={() => {}}
               />
            ))}
          </div>
        )}

        {/* Action Button */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-8px">
          <Button onClick={handleAddToCart} className="w-full py-12px text-[12px]">Add to Cart</Button>
        </div>
      </div>
    </div>
  );
}
