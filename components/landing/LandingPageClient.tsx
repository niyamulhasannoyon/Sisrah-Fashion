'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Clock, ShoppingBag, Check, Package, Truck, ShieldCheck } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { getDirectImageLink } from '@/lib/utils';

// ── Types ──
interface ProductData {
  _id: string;
  title: string;
  slug: string;
  basePrice: number;
  offerPrice?: number;
  images?: { url: string }[];
  description?: string;
  category: string;
  variants?: Array<{ size: string; color: string; stock: number; price?: number; offerPrice?: number }>;
  rating?: number;
  numReviews?: number;
}

interface Testimonial {
  name: string;
  rating: number;
  comment: string;
  image?: string;
}

interface LandingPageData {
  _id: string;
  pageTitle: string;
  slug: string;
  layoutType: 'single-product' | 'multi-product';
  productIds: ProductData[];
  customHero: {
    customHeading: string;
    customSubheading: string;
    customBannerImage: string;
  };
  promotionalElements: {
    countdownTimerToggle: boolean;
    countdownTargetDate: string | null;
    announcementText: string;
  };
  socialProof: Testimonial[];
  isActive: boolean;
}

// ── Props ──
interface LandingPageClientProps {
  page: LandingPageData;
}

// ── Countdown Timer ──
function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setExpired(true);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (expired) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
        <p className="text-sm font-bold text-red-600 uppercase tracking-wider">Offer has ended</p>
      </div>
    );
  }

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4">
      {[
        { label: 'Days', value: timeLeft.days },
        { label: 'Hours', value: timeLeft.hours },
        { label: 'Mins', value: timeLeft.minutes },
        { label: 'Secs', value: timeLeft.seconds },
      ].map((unit) => (
        <div key={unit.label} className="flex flex-col items-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-900 text-white rounded-xl flex items-center justify-center text-xl sm:text-2xl font-black shadow-lg">
            {pad(unit.value)}
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold uppercase text-gray-500 mt-1.5 tracking-widest">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Sticky CTA Bar ──
function StickyCtaBar({
  onAddToCart,
  productCount,
  disabled,
  buttonText,
}: {
  onAddToCart: () => void;
  productCount: number;
  disabled: boolean;
  buttonText: string;
}) {
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
    >
      <div className="max-w-2xl mx-auto flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-900 uppercase tracking-wider truncate">
            {productCount > 1 ? `${productCount} Items in Bundle` : 'Limited Offer'}
          </p>
          <p className="text-[10px] text-gray-500 font-medium">Free shipping on all orders</p>
        </div>
        <button
          onClick={onAddToCart}
          disabled={disabled}
          className="bg-gray-900 hover:bg-[#A31F24] text-white px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-[0.15em] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2.5 shadow-lg active:scale-[0.97] shrink-0"
        >
          <ShoppingBag size={16} />
          {buttonText}
        </button>
      </div>
    </motion.div>
  );
}

// ── Testimonial Card ──
function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center gap-1.5 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={14}
            className={i < testimonial.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
          />
        ))}
      </div>
      <p className="text-sm text-gray-600 leading-relaxed italic mb-3">
        &ldquo;{testimonial.comment}&rdquo;
      </p>
      <div className="flex items-center gap-2.5">
        {testimonial.image ? (
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200">
            <Image src={getDirectImageLink(testimonial.image)} alt={testimonial.name} fill sizes="32px" className="object-cover" />
          </div>
        ) : (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 uppercase">
            {testimonial.name.charAt(0)}
          </div>
        )}
        <span className="text-xs font-bold text-gray-900">{testimonial.name}</span>
      </div>
    </div>
  );
}

// ── Skeleton Loader ──
function LandingPageSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Announcement bar skeleton */}
      <div className="h-10 bg-gray-100" />

      {/* Hero skeleton */}
      <div className="aspect-[4/3] sm:aspect-[4/2] bg-gray-100 relative">
        <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-8 bg-gray-200 rounded w-2/3" />
          <div className="h-5 bg-gray-200 rounded w-1/4" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="h-6 bg-gray-100 rounded w-1/2" />
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="grid grid-cols-2 gap-4">
          <div className="aspect-[4/5] bg-gray-100 rounded-xl" />
          <div className="aspect-[4/5] bg-gray-100 rounded-xl" />
        </div>
        <div className="h-14 bg-gray-100 rounded-xl" />
      </div>

      {/* Sticky CTA skeleton */}
      <div className="h-20 bg-gray-100 mt-8" />
    </div>
  );
}

// ── LP Analytics helper (fire-and-forget) ──
function trackLpEvent(slug: string, eventType: 'pageview' | 'click', clickText?: string) {
  if (typeof window === 'undefined') return;
  const sessionId = sessionStorage.getItem('loomra_session_id');
  const visitorId = localStorage.getItem('loomra_visitor_id');
  const payload: Record<string, any> = {
    eventType,
    url: `/lp/${slug}`,
    sessionId: sessionId || 'lp_' + Math.random().toString(36).substring(2, 10),
    visitorId: visitorId || 'lp_vis_' + Math.random().toString(36).substring(2, 10),
    referrer: document.referrer || '',
    clickTarget: `lp_campaign:${slug}`,
  };
  if (clickText) payload.clickText = clickText;

  fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {});
}

// ── Main Component ──
export default function LandingPageClient({ page }: LandingPageClientProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const toggleCart = useCartStore((state) => state.toggleCart);

  const [mounted, setMounted] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({});
  const [bundleSelections, setBundleSelections] = useState<Record<string, boolean>>({});
  const [activeImage, setActiveImage] = useState(0);
  // Track LP page view once mounted & store campaign slug for order attribution
  useEffect(() => {
    setMounted(true);
    trackLpEvent(page.slug, 'pageview');
    // Store campaign slug so checkout can attribute orders to this campaign
    try {
      sessionStorage.setItem('loomra_campaign_slug', page.slug);
    } catch {}
  }, [page.slug]);

  // Initialize bundle selections & size/color defaults
  // Filter out any null products (deleted from DB but still referenced)
  const products = (page.productIds || []).filter((p): p is ProductData =>
    p !== null && typeof p === 'object' && '_id' in p
  );

  useEffect(() => {
    if (page.layoutType === 'multi-product') {
      const initial: Record<string, boolean> = {};
      products.forEach((p) => {
        initial[p._id] = true;
      });
      setBundleSelections(initial);
    }
    // Init size/color for each product
    const sizes: Record<string, string> = {};
    const colors: Record<string, string> = {};
    products.forEach((p) => {
      const first = p.variants?.[0];
      if (first) {
        sizes[p._id] = first.size;
        colors[p._id] = first.color;
      }
    });
    setSelectedSizes(sizes);
    setSelectedColors(colors);
  }, [page.layoutType, products.length]);

  const hasCountdown = page.promotionalElements?.countdownTimerToggle && page.promotionalElements?.countdownTargetDate;
  const announcementText = page.promotionalElements?.announcementText;
  const testimonials = page.socialProof || [];
  const isSingle = page.layoutType === 'single-product';

  // Primary product for single layout
  const primaryProduct = isSingle ? products[0] : null;

  // Images for hero section
  const heroImage =
    (page.customHero?.customBannerImage && getDirectImageLink(page.customHero.customBannerImage.trim())) ||
    primaryProduct?.images?.[activeImage]?.url ||
    products[0]?.images?.[0]?.url ||
    '/images/placeholder.jpg';

  // Heading / subheading
  const heading = (page.customHero?.customHeading && page.customHero.customHeading.trim()) || primaryProduct?.title || page.pageTitle;
  const subheading = (page.customHero?.customSubheading && page.customHero.customSubheading.trim()) || primaryProduct?.description || '';

  // Price calculation
  const totalPrice = useMemo(() => {
    if (isSingle && primaryProduct) {
      return primaryProduct.offerPrice || primaryProduct.basePrice;
    }
    let total = 0;
    products.forEach((p) => {
      if (bundleSelections[p._id]) {
        total += p.offerPrice || p.basePrice;
      }
    });
    return total;
  }, [isSingle, primaryProduct, products, bundleSelections]);

  const totalOriginalPrice = useMemo(() => {
    if (isSingle && primaryProduct) {
      return primaryProduct.offerPrice ? primaryProduct.basePrice : 0;
    }
    let total = 0;
    products.forEach((p) => {
      if (bundleSelections[p._id]) {
        total += p.basePrice;
      }
    });
    return total;
  }, [isSingle, primaryProduct, products, bundleSelections]);

  const savings = totalOriginalPrice - totalPrice;
  const hasSavings = savings > 0;

  // Count selected products in bundle
  const selectedCount = useMemo(
    () => Object.values(bundleSelections).filter(Boolean).length,
    [bundleSelections]
  );

  // ── Add to Cart Handler ──
  const handleAddToCart = useCallback(() => {
    if (isSingle && primaryProduct) {
      const image = primaryProduct.images?.[0]?.url || '/images/placeholder.jpg';
      addToCart({
        _id: primaryProduct._id,
        title: primaryProduct.title,
        price: primaryProduct.offerPrice || primaryProduct.basePrice,
        image,
        selectedSize: selectedSizes[primaryProduct._id] || 'M',
        selectedColor: selectedColors[primaryProduct._id] || 'Black',
      });
    } else {
      // Bundle: add all selected products
      products.forEach((p) => {
        if (bundleSelections[p._id]) {
          const image = p.images?.[0]?.url || '/images/placeholder.jpg';
          addToCart({
            _id: p._id,
            title: p.title,
            price: p.offerPrice || p.basePrice,
            image,
            selectedSize: selectedSizes[p._id] || 'M',
            selectedColor: selectedColors[p._id] || 'Black',
          });
        }
      });
    }

    // Track conversion
    trackLpEvent(page.slug, 'click', 'lp_add_to_cart');

    toggleCart();
  }, [isSingle, primaryProduct, products, selectedSizes, selectedColors, bundleSelections, addToCart, toggleCart, page.slug]);

  const disabled = selectedCount === 0;
  const ctaText = !mounted
    ? 'Loading...'
    : isSingle
    ? 'Add to Cart'
    : `Add ${selectedCount} Item${selectedCount !== 1 ? 's' : ''} to Cart`;

  if (!mounted) {
    return <LandingPageSkeleton />;
  }

  // ── RENDER ──
  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24">
      {/* ── Announcement Bar ── */}
      {announcementText && (
        <div className="bg-gray-900 text-white text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] py-2.5 text-center">
          <span className="inline-flex items-center gap-2">
            <Truck size={14} className="text-emerald-400" />
            {announcementText}
          </span>
        </div>
      )}

      {/* ── Hero Section ── */}
      <div className="relative bg-gray-100">
        <div className="aspect-[4/3] sm:aspect-[4/2] md:aspect-[21/9] relative">
          <Image
            src={heroImage}
            alt={heading}
            fill
            priority
            sizes="100vw"
            className="object-cover object-top"
          />
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Hero Text */}
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 md:p-12 max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              {subheading && (
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-white/80 mb-2">
                  {subheading}
                </p>
              )}
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-white uppercase tracking-[0.02em] leading-tight">
                {heading}
              </h1>

              {/* Price */}
              <div className="mt-3 sm:mt-4 flex items-center justify-center gap-3">
                {hasSavings && (
                  <span className="text-lg sm:text-2xl text-white/60 line-through font-bold">
                    ৳{totalOriginalPrice.toLocaleString()}
                  </span>
                )}
                <span className={`font-black ${hasSavings ? 'text-emerald-400 text-2xl sm:text-4xl' : 'text-white text-xl sm:text-3xl'}`}>
                  ৳{totalPrice.toLocaleString()}
                </span>
              </div>
              {hasSavings && (
                <p className="text-[10px] sm:text-xs font-bold text-emerald-400 mt-1 uppercase tracking-wider">
                  Save ৳{savings.toLocaleString()}
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Countdown Timer ── */}
      {hasCountdown && (
        <div className="bg-white border-b border-gray-100 py-6 sm:py-8">
          <div className="max-w-2xl mx-auto px-4 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
              <Clock size={14} /> Offer Ends In
            </div>
            <CountdownTimer targetDate={page.promotionalElements.countdownTargetDate!} />
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10 space-y-8">
        {/* ── Single Product Layout ── */}
        {isSingle && primaryProduct && (
          <div className="space-y-6">
            {/* Image Gallery */}
            {primaryProduct.images && primaryProduct.images.length > 0 && (
              <div className="space-y-3">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                  <Image
                    src={primaryProduct.images[activeImage]?.url || heroImage}
                    alt={primaryProduct.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 600px"
                    className="object-cover object-top"
                    priority
                  />
                </div>
                {primaryProduct.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {primaryProduct.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(idx)}
                        className={`relative w-16 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                          activeImage === idx ? 'border-gray-900 opacity-100' : 'border-transparent opacity-50 hover:opacity-75 active:opacity-100'
                        }`}
                      >
                        <Image
                          src={img.url}
                          alt={`${primaryProduct.title} view ${idx + 1}`}
                          fill
                          sizes="64px"
                          className="object-cover object-top"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Product Info */}
            <div className="space-y-4">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-wider">
                {primaryProduct.title}
              </h2>

              {products.length > 0 && primaryProduct.rating && primaryProduct.rating > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={16} fill={i < Math.round(primaryProduct.rating || 0) ? 'currentColor' : 'none'} className={i < Math.round(primaryProduct.rating || 0) ? 'text-amber-400' : 'text-gray-200'} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    ({primaryProduct.numReviews || 0} reviews)
                  </span>
                </div>
              )}

              {primaryProduct.description && (
                <p className="text-sm text-gray-600 leading-relaxed">
                  {primaryProduct.description}
                </p>
              )}

              {/* Size & Color Selector (single product) */}
              {primaryProduct.variants && primaryProduct.variants.length > 0 && (
                <div className="space-y-4 pt-2">
                  {/* Size selector */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-500">
                      Size: <span className="text-gray-900">{selectedSizes[primaryProduct._id] || 'Select'}</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[...new Set(primaryProduct.variants.map((v) => v.size))].map((size) => (
                        <button
                          key={size}
                          onClick={() =>
                            setSelectedSizes({ ...selectedSizes, [primaryProduct._id]: size })
                          }
                          className={`min-w-[44px] min-h-[44px] rounded-lg border text-xs font-bold transition-all duration-200 ${
                            selectedSizes[primaryProduct._id] === size
                              ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 active:bg-gray-100 active:scale-[0.95]'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color selector */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-500">
                      Color: <span className="text-gray-900">{selectedColors[primaryProduct._id] || 'Select'}</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[...new Set(primaryProduct.variants.map((v) => v.color))].map((color) => (
                        <button
                          key={color}
                          onClick={() =>
                            setSelectedColors({ ...selectedColors, [primaryProduct._id]: color })
                          }
                          className={`px-3.5 py-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
                            selectedColors[primaryProduct._id] === color
                              ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                              : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400 active:bg-gray-100 active:scale-[0.97]'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
                {[
                  { icon: Truck, label: 'Free Shipping' },
                  { icon: ShieldCheck, label: 'Secure Checkout' },
                  { icon: Package, label: 'Easy Returns' },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <item.icon size={18} className="mx-auto text-gray-400 mb-1" />
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Multi-Product Bundle Layout ── */}
        {!isSingle && products.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Package size={20} /> This Bundle Includes
              </h2>
              <span className="text-xs font-bold text-gray-400">
                {selectedCount} of {products.length} selected
              </span>
            </div>

            <div className="space-y-3">
              {products.map((product, idx) => {
                const isSelected = bundleSelections[product._id] ?? true;
                const productImage = product.images?.[0]?.url || '/images/placeholder.jpg';

                return (
                  <div
                    key={product._id}
                    className={`border rounded-xl p-4 transition-all duration-200 ${
                      isSelected
                        ? 'border-gray-900 bg-white shadow-sm'
                        : 'border-gray-100 bg-gray-50/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <button
                        onClick={() =>
                          setBundleSelections({
                            ...bundleSelections,
                            [product._id]: !isSelected,
                          })
                        }
                        className={`mt-1 w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? 'bg-gray-900 border-gray-900' : 'border-gray-300'
                        }`}
                      >
                        {isSelected && (
                          <Check size={14} className="text-white" strokeWidth={3} />
                        )}
                      </button>

                      {/* Thumbnail */}
                      <div className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                        <Image
                          src={productImage}
                          alt={product.title}
                          fill
                          sizes="80px"
                          className="object-cover object-top"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 truncate">{product.title}</h3>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">{product.category}</p>

                        {/* Size & Color chips (inline) */}
                        {product.variants && product.variants.length > 0 && isSelected && (
                          <div className="flex gap-3 mt-2">
                            <select
                              value={selectedSizes[product._id] || ''}
                              onChange={(e) =>
                                setSelectedSizes({ ...selectedSizes, [product._id]: e.target.value })
                              }
                              className="text-[9px] font-bold uppercase border border-gray-200 rounded-lg px-2 py-1.5 bg-white outline-none focus:border-gray-900"
                            >
                              {[...new Set(product.variants.map((v) => v.size))].map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            <select
                              value={selectedColors[product._id] || ''}
                              onChange={(e) =>
                                setSelectedColors({ ...selectedColors, [product._id]: e.target.value })
                              }
                              className="text-[9px] font-bold uppercase border border-gray-200 rounded-lg px-2 py-1.5 bg-white outline-none focus:border-gray-900"
                            >
                              {[...new Set(product.variants.map((v) => v.color))].map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm font-bold text-gray-900">
                            ৳{(product.offerPrice || product.basePrice).toLocaleString()}
                          </span>
                          {product.offerPrice && product.offerPrice < product.basePrice && (
                            <span className="text-xs text-gray-400 line-through">
                              ৳{product.basePrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bundle Total */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Bundle Total</span>
                <span className="font-bold text-gray-900">৳{totalPrice.toLocaleString()}</span>
              </div>
              {hasSavings && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">You Save</span>
                  <span className="font-bold text-emerald-600">৳{savings.toLocaleString()}</span>
                </div>
              )}
              {!hasSavings && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Free Shipping</span>
                  <span className="font-bold text-emerald-600">✓ Included</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Social Proof ── */}
        {testimonials.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                What Our Customers Say
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {testimonials.map((t, idx) => (
                <TestimonialCard key={idx} testimonial={t} />
              ))}
            </div>
          </div>
        )}

        {/* ── Footer Links ── */}
        <div className="text-center pt-4 border-t border-gray-100">
          <Link href="/shop" className="text-[10px] sm:text-xs text-gray-400 hover:text-gray-700 active:text-gray-900 transition-colors uppercase tracking-wider font-medium">
            View Full Collection →
          </Link>
        </div>
      </div>

      {/* ── Sticky CTA Bar ── */}
      <StickyCtaBar
        onAddToCart={handleAddToCart}
        productCount={selectedCount}
        disabled={disabled}
        buttonText={ctaText}
      />
    </div>
  );
}
