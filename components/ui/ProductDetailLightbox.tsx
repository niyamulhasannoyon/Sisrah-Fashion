'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Image as ImageIcon } from 'lucide-react';
import { getDirectImageLink } from '@/lib/utils';

export interface ProductDetailLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: Array<string | { url: string; title?: string; caption?: string }>;
  initialIndex?: number;
  productTitle?: string;
  category?: string;
}

export default function ProductDetailLightbox({
  isOpen,
  onClose,
  images = [],
  initialIndex = 0,
  productTitle = 'Product Details',
  category,
}: ProductDetailLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomScale, setZoomScale] = useState(1);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Normalize image urls
  const normalizedImages: string[] = images
    .map((img) => {
      if (!img) return '';
      if (typeof img === 'string') return getDirectImageLink(img);
      if (typeof img === 'object' && img.url) return getDirectImageLink(img.url);
      return '';
    })
    .filter(Boolean);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.min(Math.max(0, initialIndex), Math.max(0, normalizedImages.length - 1)));
      setZoomScale(1);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialIndex, normalizedImages.length]);

  const handlePrev = useCallback(() => {
    setZoomScale(1);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : normalizedImages.length - 1));
  }, [normalizedImages.length]);

  const handleNext = useCallback(() => {
    setZoomScale(1);
    setCurrentIndex((prev) => (prev < normalizedImages.length - 1 ? prev + 1 : 0));
  }, [normalizedImages.length]);

  const toggleZoom = useCallback(() => {
    setZoomScale((prev) => (prev === 1 ? 2 : prev === 2 ? 3 : 1));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext]);

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;
    if (Math.abs(diffX) > 50 && zoomScale === 1) {
      if (diffX > 0) {
        handleNext(); // swipe left -> next
      } else {
        handlePrev(); // swipe right -> prev
      }
    }
    setTouchStartX(null);
  };

  if (!isOpen || normalizedImages.length === 0) return null;

  const currentImage = normalizedImages[currentIndex] || '/images/placeholder.jpg';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex flex-col justify-between select-none"
        >
          {/* Top Bar Header */}
          <div className="relative z-20 flex items-center justify-between px-4 py-3 sm:px-6 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-3 text-white min-w-0 pr-4">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <ImageIcon size={16} className="text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                  {productTitle}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {category && (
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                      {category}
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                    ছবি {currentIndex + 1} / {normalizedImages.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions (Zoom Controls & Close Button) */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={toggleZoom}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-semibold backdrop-blur-sm transition-all cursor-pointer border border-white/10"
                title="Zoom image"
              >
                {zoomScale === 1 ? <ZoomIn size={15} /> : <ZoomOut size={15} />}
                <span className="hidden sm:inline">{zoomScale}x</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-red-500 hover:text-white active:scale-90 flex items-center justify-center text-white backdrop-blur-sm transition-all cursor-pointer border border-white/10"
                aria-label="Close detail viewer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Center Main Image Canvas */}
          <div
            className="relative flex-1 flex items-center justify-center overflow-hidden px-4 py-2"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Prev Arrow Button */}
            {normalizedImages.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/50 hover:bg-black/80 active:scale-90 text-white flex items-center justify-center backdrop-blur-sm transition-all border border-white/20 cursor-pointer shadow-xl"
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {/* Main Interactive Zoomable Image */}
            <div
              className={`relative w-full h-full max-w-4xl max-h-[72vh] sm:max-h-[76vh] flex items-center justify-center ${
                zoomScale > 1 ? 'cursor-grab active:cursor-grabbing overflow-auto' : 'cursor-zoom-in'
              }`}
              onClick={toggleZoom}
            >
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: zoomScale }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                className="relative w-full h-full aspect-[4/5] sm:aspect-[3/4] flex items-center justify-center"
              >
                <Image
                  src={currentImage}
                  alt={`${productTitle} detail photo ${currentIndex + 1}`}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                  quality={95}
                />
              </motion.div>
            </div>

            {/* Next Arrow Button */}
            {normalizedImages.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/50 hover:bg-black/80 active:scale-90 text-white flex items-center justify-center backdrop-blur-sm transition-all border border-white/20 cursor-pointer shadow-xl"
                aria-label="Next image"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          <div className="relative z-20 px-4 py-3 sm:py-4 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
            <div className="max-w-xl mx-auto flex flex-col items-center gap-2">
              <p className="text-[10px] sm:text-xs text-gray-400 font-medium tracking-wide">
                {zoomScale === 1
                  ? '🔍 ছবিতে ট্যাপ বা ক্লিক করে জুম করুন (Tap to zoom 2x / 3x)'
                  : '🔍 আগের সাইজে ফিরতে ছবিতে আবার ট্যাপ করুন (Tap to reset)'}
              </p>

              {normalizedImages.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 px-2 custom-scrollbar">
                  {normalizedImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setZoomScale(1);
                        setCurrentIndex(idx);
                      }}
                      className={`relative w-12 h-14 sm:w-14 sm:h-18 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                        currentIndex === idx
                          ? 'border-amber-400 scale-105 shadow-lg opacity-100 ring-2 ring-amber-400/30'
                          : 'border-white/20 opacity-50 hover:opacity-90'
                      }`}
                    >
                      <Image
                        src={imgUrl}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        sizes="60px"
                        className="object-cover object-top"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
