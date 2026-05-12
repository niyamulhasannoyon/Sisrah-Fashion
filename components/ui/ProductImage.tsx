'use client';

interface ProductImageProps {
  src: string;
  alt: string;
  hoverSrc?: string; // Optional secondary image for hover effect
}

export default function ProductImage({ src, alt, hoverSrc }: ProductImageProps) {
  return (
    <div className="relative w-full aspect-square bg-[#F9F9F9] rounded-[4px] overflow-hidden group">
      {/* Primary Image */}
      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 ease-in-out ${hoverSrc ? 'group-hover:opacity-0' : ''}`}
      />
      
      {/* Hover Image (if provided) */}
      {hoverSrc && (
        <img
          src={hoverSrc}
          alt={`${alt} lifestyle`}
          className="absolute inset-0 w-full h-full object-cover object-center opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100"
        />
      )}
    </div>
  );
}
