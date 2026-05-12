import ProductImage from '../ui/ProductImage';
import ColorSwatch from '../ui/ColorSwatch';
import Button from '../ui/Button';

export default function RefinedProductCard({ product }: { product: any }) {
  return (
    <div className="flex flex-col gap-16px cursor-pointer group">
      
      {/* 1:1 Image Component */}
      <ProductImage 
        src={product.images[0].url} 
        alt={product.title} 
        hoverSrc={product.images[1]?.url} 
      />

      <div className="flex flex-col gap-8px px-4px">
        {/* Title & Price */}
        <div className="flex justify-between items-start">
           <h3 className="text-body font-medium text-[#1A1A1A] truncate pr-8px">{product.title}</h3>
           <p className="text-body font-bold text-[#A31F24] whitespace-nowrap">৳ {product.price}</p>
        </div>

        {/* 30px Swatches */}
        <div className="flex gap-8px mt-4px">
          {product.availableColors.map((color: any) => (
             <ColorSwatch 
               key={color.name}
               colorHex={color.hex}
               colorName={color.name}
               isSelected={false} // Would be controlled by state
               onClick={() => {}}
             />
          ))}
        </div>

        {/* 4px Rounded Action Button - Slides up slightly on hover */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-8px">
          <Button className="w-full py-12px text-[12px]">Add to Cart</Button>
        </div>
      </div>
    </div>
  );
}
