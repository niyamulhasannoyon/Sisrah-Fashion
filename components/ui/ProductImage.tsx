'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductImageProps {
  src: string;
  alt: string;
  hoverSrc?: string;
  className?: string;
  aspectRatio?: 'portrait' | 'square';
  sizes?: string;
}

export default function ProductImage({
  src,
  alt,
  hoverSrc,
  className = '',
  aspectRatio = 'square',
  sizes = '(max-width: 640px) 50vw, 288px',
}: ProductImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const aspectClass =
    aspectRatio === 'portrait' ? 'aspect-[4/5]' : 'aspect-square';

  // ── Elegant text fallback when the image URL fails ──
  if (error || !src) {
    return (
      <div
        className={`relative w-full ${aspectClass} bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden flex items-center justify-center ${className}`}
      >
        <div className="flex flex-col items-center gap-1.5 opacity-60">
          <svg
            className="w-6 h-6 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
            />
          </svg>
          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-300">
            No Image
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full ${aspectClass} bg-neutral-200 rounded-lg overflow-hidden group ${className}`}
    >
      {/* Skeleton loader while image loads */}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-neutral-200 z-10" />
      )}

      {/* Primary Image */}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className={`object-cover object-center transition-all duration-500 ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${hoverSrc ? 'group-hover:opacity-0' : 'group-hover:scale-105'}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        loading="lazy"
      />

      {/* Hover Image (if provided) */}
      {hoverSrc && (
        <Image
          src={hoverSrc}
          alt={`${alt} — alternate view`}
          fill
          sizes={sizes}
          className="absolute inset-0 object-cover object-center opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100"
          loading="lazy"
        />
      )}
    </div>
  );
}
