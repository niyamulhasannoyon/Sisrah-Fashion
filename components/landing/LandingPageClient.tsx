'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Clock, ShoppingBag, Check, Package, Truck, ShieldCheck, MapPin, User, Phone, Mail, HelpCircle, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useSettingsStore } from '@/store/useSettingsStore';
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
    customMobileBannerImage?: string;
  };
  promotionalElements: {
    countdownTimerToggle: boolean;
    countdownTargetDate: string | null;
    announcementText: string;
  };
  offerSettings?: {
    freeShippingToggle: boolean;
    freeShippingMinQty: number;
    freeShippingMinAmount: number;
    comboDiscountToggle: boolean;
    comboDiscountType: 'percentage' | 'fixed';
    comboDiscountValue: number;
    comboMinQty: number;
  };
  socialProof: Testimonial[];
  isActive: boolean;
}

interface LandingPageClientProps {
  page: LandingPageData;
}

const districts = [
  'Dhaka', 'Bagerhat', 'Bandarban', 'Barguna', 'Barisal', 'Bhola', 'Bogra', 'Brahmanbaria', 'Chandpur', 'Chapainawabganj', 'Chittagong', 'Chuadanga', 'Comilla', "Cox's Bazar", 'Dinajpur', 'Faridpur', 'Feni', 'Gaibandha', 'Gazipur', 'Gopalganj', 'Habiganj', 'Jamalpur', 'Jessore', 'Jhalokati', 'Jhenaidah', 'Joypurhat', 'Khagrachari', 'Khulna', 'Kishoreganj', 'Kurigram', 'Kushtia', 'Lakshmipur', 'Lalmonirhat', 'Madaripur', 'Magura', 'Manikganj', 'Maulvibazar', 'Meherpur', 'Munshiganj', 'Mymensingh', 'Naogaon', 'Narail', 'Narayanganj', 'Narsingdi', 'Natore', 'Netrokona', 'Nilphamari', 'Noakhali', 'Pabna', 'Panchagarh', 'Patuakhali', 'Pirojpur', 'Rajbari', 'Rajshahi', 'Rangamati', 'Rangpur', 'Satkhira', 'Shariatpur', 'Sherpur', 'Sirajganj', 'Sunamganj', 'Sylhet', 'Tangail', 'Thakurgaon'
];

const HOTSPOTS = [
  { id: 1, top: '25%', left: '52%', title: 'Premium Structured Collar', desc: 'Stays sharp and holds shape after multiple washes.' },
  { id: 2, top: '55%', left: '38%', title: '100% Breathable Fabric', desc: 'Premium cotton/linen blend designed to keep you cool in South Asian heat.' },
  { id: 3, top: '75%', left: '68%', title: 'Fine Double-Stitched Seams', desc: 'Crafted with high-strength threads for ultimate longevity.' }
];

const FAQ_ITEMS = [
  { q: "অর্ডার করার নিয়ম কি?", a: "সাইজ ও কালার সিলেক্ট করে উপরে দেওয়া অর্ডার ফর্মে আপনার নাম, মোবাইল নাম্বার এবং ঠিকানা দিয়ে 'Confirm Order' বাটনে ক্লিক করুন। আপনার অর্ডারটি সফলভাবে সাবমিট হয়ে যাবে।" },
  { q: "ডেলিভারি চার্জ কত?", a: "ঢাকা সিটির ভেতরে ডেলিভারি চার্জ ৬০ টাকা, এবং ঢাকা সিটির বাইরে ১২০ টাকা। আমাদের ফ্রি শিপিং শর্ত পূরণ করলে ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!" },
  { q: "পণ্য হাতে পেতে কতদিন সময় লাগবে?", a: "ঢাকা সিটির ভেতরে অর্ডার কনফার্ম করার ১-২ কর্মদিবস এবং ঢাকা সিটির বাইরে ৩-৪ কর্মদিবসের মধ্যে হোম ডেলিভারি করা হয়।" },
  { q: "সাইজ বা অন্য কোনো সমস্যা হলে পরিবর্তন করা যাবে কি?", a: "হ্যাঁ, যেকোনো সাইজ বা কালার সংক্রান্ত সমস্যায় ডেলিভারি পাওয়ার ৭ দিনের মধ্যে আপনি সহজেই পরিবর্তন (Exchange) করতে পারবেন। আমাদের হোয়াটসঅ্যাপে যোগাযোগ করলেই হবে।" }
];

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
  onCtaClick,
  disabled,
  totalPrice,
  shippingCost,
}: {
  onCtaClick: () => void;
  disabled: boolean;
  totalPrice: number;
  shippingCost: number;
}) {
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
    >
      <div className="max-w-2xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-1 sm:flex-col">
          <p className="text-[10px] font-black text-gray-900 uppercase tracking-wider">
            Limited Offer
          </p>
          <span className="hidden sm:inline text-gray-300">|</span>
          <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider whitespace-nowrap">
            Cash on Delivery (হাতে পেয়ে মূল্য দিন)
          </p>
        </div>
        <button
          onClick={onCtaClick}
          disabled={disabled}
          className="bg-[#A31F24] hover:bg-[#8D181D] hover:scale-[1.02] active:scale-[0.97] text-white py-3 px-8 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-0.5 shadow-[0_6px_20px_rgba(163,31,36,0.3)] hover:shadow-[0_8px_25px_rgba(163,31,36,0.45)] w-full sm:w-auto font-sans"
        >
          <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.05em] leading-none">
            <ShoppingBag size={14} className="shrink-0" />
            ORDER NOW — ৳{(totalPrice + shippingCost).toLocaleString()}
          </span>
          <span className="text-[8px] font-bold text-white/80 lowercase tracking-wide font-bengali leading-none mt-0.5">
            অর্ডার করতে এখানে ক্লিক করুন
          </span>
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
      <div className="h-10 bg-gray-100" />
      <div className="aspect-[4/3] sm:aspect-[4/2] bg-gray-100 relative">
        <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-8 bg-gray-200 rounded w-2/3" />
          <div className="h-5 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
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
  const { settings, fetchSettings } = useSettingsStore();
  const [mounted, setMounted] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>(() => {
    const sizes: Record<string, string> = {};
    (page.productIds || []).forEach((p) => {
      if (p && typeof p === 'object' && '_id' in p) {
        const first = p.variants?.[0];
        if (first) {
          sizes[p._id] = first.size;
        }
      }
    });
    return sizes;
  });
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>(() => {
    const colors: Record<string, string> = {};
    (page.productIds || []).forEach((p) => {
      if (p && typeof p === 'object' && '_id' in p) {
        const first = p.variants?.[0];
        if (first) {
          colors[p._id] = first.color;
        }
      }
    });
    return colors;
  });
  const [bundleSelections, setBundleSelections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (page.layoutType === 'multi-product') {
      (page.productIds || []).forEach((p) => {
        if (p && typeof p === 'object' && '_id' in p) {
          initial[p._id] = true;
        }
      });
    }
    return initial;
  });
  const [activeImage, setActiveImage] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Direct Order Form State
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: 'Dhaka',
  });
  const [phoneError, setPhoneError] = useState('');
  const [formError, setFormError] = useState('');
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  // Fetch settings & track view
  useEffect(() => {
    setMounted(true);
    fetchSettings();
    trackLpEvent(page.slug, 'pageview');
    try {
      sessionStorage.setItem('loomra_campaign_slug', page.slug);
    } catch {}
  }, [page.slug, fetchSettings]);

  const products = useMemo(() => {
    return (page.productIds || []).filter((p): p is ProductData =>
      p !== null && typeof p === 'object' && '_id' in p
    );
  }, [page.productIds]);

  const hasCountdown = page.promotionalElements?.countdownTimerToggle && page.promotionalElements?.countdownTargetDate;
  const announcementText = page.promotionalElements?.announcementText;
  const testimonials = page.socialProof || [];
  const isSingle = page.layoutType === 'single-product';
  const primaryProduct = isSingle ? products[0] : null;

  const desktopHeroImage = useMemo(() => {
    return (page.customHero?.customBannerImage && getDirectImageLink(page.customHero.customBannerImage.trim())) ||
      primaryProduct?.images?.[activeImage]?.url ||
      products[0]?.images?.[0]?.url ||
      '/images/placeholder.jpg';
  }, [page.customHero, primaryProduct, products, activeImage]);

  const mobileHeroImage = useMemo(() => {
    return (page.customHero?.customMobileBannerImage && getDirectImageLink(page.customHero.customMobileBannerImage.trim())) ||
      desktopHeroImage;
  }, [page.customHero, desktopHeroImage]);

  const heroImage = desktopHeroImage;

  const heading = page.customHero?.customHeading?.trim() || primaryProduct?.title || page.pageTitle;
  const subheading = page.customHero?.customSubheading?.trim() || primaryProduct?.description || '';

  const selectedCount = useMemo(() => {
    if (isSingle) return 1;
    return Object.values(bundleSelections).filter(Boolean).length;
  }, [isSingle, bundleSelections]);

  const comboDiscount = useMemo(() => {
    const settings = page.offerSettings;
    if (!settings?.comboDiscountToggle) return 0;
    
    if (selectedCount >= (settings.comboMinQty ?? 2)) {
      let subtotal = 0;
      products.forEach((p) => {
        if (bundleSelections[p._id]) {
          subtotal += p.offerPrice || p.basePrice;
        }
      });
      
      if (settings.comboDiscountType === 'percentage') {
        return Math.round((subtotal * (settings.comboDiscountValue ?? 0)) / 100);
      } else {
        return settings.comboDiscountValue ?? 0;
      }
    }
    return 0;
  }, [page.offerSettings, selectedCount, products, bundleSelections]);

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
    return Math.max(0, total - comboDiscount);
  }, [isSingle, primaryProduct, products, bundleSelections, comboDiscount]);

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

  const isShippingFree = useCallback(() => {
    // Check landing-page specific free shipping settings first
    const pageShipping = page.offerSettings;
    if (pageShipping?.freeShippingToggle) {
      const minQty = pageShipping.freeShippingMinQty ?? 0;
      const minAmt = pageShipping.freeShippingMinAmount ?? 0;
      
      if (minQty === 0 && minAmt === 0) return true;
      
      const meetsQty = minQty > 0 ? selectedCount >= minQty : true;
      const meetsAmt = minAmt > 0 ? totalPrice >= minAmt : true;
      
      if (meetsQty && meetsAmt) return true;
    }

    // Fallback to website global settings
    if (!settings) return false;
    const trigger = settings.freeShippingTrigger;
    if (trigger === 'quantity') {
      const minQty = settings.freeShippingMinQuantity ?? 2;
      return selectedCount >= minQty;
    }
    if (trigger === 'amount') {
      const minAmount = settings.freeShippingMinAmount ?? 3000;
      return totalPrice >= minAmount;
    }
    return false;
  }, [page.offerSettings, settings, selectedCount, totalPrice]);

  const getShippingCost = useCallback(() => {
    if (isShippingFree()) return 0;
    if (!shippingInfo.city) return 0;
    const isDhaka = shippingInfo.city.toLowerCase().includes('dhaka');
    if (isDhaka) {
      return settings?.shippingInsideDhaka ?? 60;
    }
    return settings?.shippingOutsideDhaka ?? 120;
  }, [isShippingFree, shippingInfo.city, settings]);

  // Scroll to Order Form Handler
  const handleScrollToForm = useCallback(() => {
    trackLpEvent(page.slug, 'click', 'lp_sticky_cta_scroll');
    const formElement = document.getElementById('lp-checkout-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [page.slug]);

  // Order Placement Handler
  const handlePlaceDirectOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');
    setFormError('');
    setIsOrdering(true);

    if (!shippingInfo.name.trim()) {
      setFormError('Please enter your name');
      setIsOrdering(false);
      return;
    }

    const bdPhoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
    if (!bdPhoneRegex.test(shippingInfo.phone.trim())) {
      setPhoneError('Please enter a valid 11-digit phone number (e.g. 017XXXXXXXX)');
      setIsOrdering(false);
      return;
    }

    if (!shippingInfo.address.trim()) {
      setFormError('Please enter your detailed shipping address');
      setIsOrdering(false);
      return;
    }

    let orderItems: any[] = [];
    if (isSingle && primaryProduct) {
      const imgUrl = primaryProduct.images?.[0]?.url || '/images/placeholder.jpg';
      orderItems.push({
        title: primaryProduct.title,
        price: primaryProduct.offerPrice || primaryProduct.basePrice,
        image: imgUrl,
        selectedSize: selectedSizes[primaryProduct._id] || 'M',
        selectedColor: selectedColors[primaryProduct._id] || 'Black',
        quantity: 1,
      });
    } else {
      products.forEach((p) => {
        if (bundleSelections[p._id]) {
          const imgUrl = p.images?.[0]?.url || '/images/placeholder.jpg';
          orderItems.push({
            title: p.title,
            price: p.offerPrice || p.basePrice,
            image: imgUrl,
            selectedSize: selectedSizes[p._id] || 'M',
            selectedColor: selectedColors[p._id] || 'Black',
            quantity: 1,
          });
        }
      });
    }

    if (orderItems.length === 0) {
      setFormError('Please select at least one product to order');
      setIsOrdering(false);
      return;
    }

    const finalTotal = totalPrice + getShippingCost();

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingInfo,
          orderItems,
          totalAmount: finalTotal,
          paymentMethod: 'Cash on Delivery',
          paymentStatus: 'Pending',
          campaignSlug: page.slug,
          ...(comboDiscount > 0 && {
            couponCode: 'COMBO_DISCOUNT',
            couponDiscount: comboDiscount,
          }),
        }),
      });

      const data = await res.json();
      if (data.success) {
        trackLpEvent(page.slug, 'click', 'lp_direct_order_success');
        try {
          localStorage.setItem('loomra_latest_order_id', data.orderId.toString());
          localStorage.setItem('loomra_latest_order_phone', data.phone);
        } catch (storageErr) {
          console.error('[LP Order Success] Failed to save to localStorage:', storageErr);
        }
        setOrderSuccess({
          orderId: data.orderId,
          name: shippingInfo.name,
          phone: data.phone,
          total: finalTotal,
        });
      } else {
        setFormError(data.error || 'Failed to place order. Please try again.');
      }
    } catch (err) {
      console.error('Error placing direct order:', err);
      setFormError('Failed to place order due to network issue.');
    } finally {
      setIsOrdering(false);
    }
  };

  const disabled = selectedCount === 0;
  // ── ORDER SUCCESS SCREEN ──
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white border border-gray-100 rounded-3xl p-8 shadow-xl text-center space-y-6 font-sans"
        >
          <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 size={36} strokeWidth={2.5} className="animate-bounce" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-wide">
              অর্ডারটি সফল হয়েছে!
            </h2>
            <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">
              Order Placed Successfully
            </p>
            <p className="text-[11px] text-gray-500">
              আপনার সাথে খুব শীঘ্রই যোগাযোগ করে অর্ডারটি কনফার্ম করা হবে।
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-5 text-left border border-gray-100 space-y-3.5">
            <div className="flex justify-between items-center text-xs font-bold text-gray-600 border-b border-gray-200/60 pb-2">
              <span>অর্ডার আইডি:</span>
              <span className="text-gray-900">#{orderSuccess.orderId}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold text-gray-600 border-b border-gray-200/60 pb-2">
              <span>গ্রাহকের নাম:</span>
              <span className="text-gray-900">{orderSuccess.name}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold text-gray-600 border-b border-gray-200/60 pb-2">
              <span>মোবাইল নাম্বার:</span>
              <span className="text-gray-900">{orderSuccess.phone}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold text-gray-600">
              <span>মোট পরিশোধযোগ্য মূল্য:</span>
              <span className="text-[#A31F24] font-black text-sm">৳{orderSuccess.total.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href={`/track-order?id=${orderSuccess.orderId}&phone=${orderSuccess.phone}`}
              className="w-full bg-[#A31F24] hover:bg-[#82181C] text-white py-4 rounded-xl text-xs font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#A31F24]/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Truck size={16} className="animate-pulse" />
              অর্ডার ট্র্যাক করুন (Track Now)
            </Link>

            <div className="grid grid-cols-2 gap-3">
              <a
                href={`https://wa.me/${settings?.whatsappNumber || '8801700000000'}?text=Hello,%20I%20have%20placed%20order%20%23${orderSuccess.orderId}%20on%20AS%20SIDRAT.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-1.5 shadow-md"
              >
                WhatsApp Support
              </a>
              <Link
                href="/shop"
                className="w-full bg-[#1A1A1A] hover:bg-gray-800 text-white py-3.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-[0.1em] transition-all block text-center shadow-md"
              >
                Shop More
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24 font-sans">
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
      <div className="relative bg-gray-100 overflow-hidden">
        <div className="aspect-[4/3] sm:aspect-[4/2] md:aspect-[21/9] relative">
          {/* Mobile Image */}
          <div className="sm:hidden w-full h-full absolute inset-0">
            <Image
              src={mobileHeroImage}
              alt={heading}
              fill
              priority
              fetchPriority="high"
              sizes="100vw"
              className="object-cover object-top"
            />
          </div>
          {/* Desktop Image */}
          <div className="hidden sm:block w-full h-full absolute inset-0">
            <Image
              src={desktopHeroImage}
              alt={heading}
              fill
              priority
              fetchPriority="high"
              sizes="100vw"
              className="object-cover object-top"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent pointer-events-none" />

          {/* Hero Text */}
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 md:p-12 max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              {subheading && (
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-white/80 mb-2 font-bengali">
                  {subheading}
                </p>
              )}
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-white uppercase tracking-[0.02em] leading-tight font-bengali">
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
            {/* Image Gallery with interactive hotspots */}
            {primaryProduct.images && primaryProduct.images.length > 0 && (
              <div className="space-y-3">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 group">
                  <Image
                    src={primaryProduct.images[activeImage]?.url || heroImage}
                    alt={primaryProduct.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 600px"
                    className="object-cover object-top"
                    priority
                  />
                  
                  {/* Hotspots overlay */}
                  {HOTSPOTS.map((hotspot) => (
                    <div
                      key={hotspot.id}
                      className="absolute z-20 cursor-pointer"
                      style={{ top: hotspot.top, left: hotspot.left }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveHotspot(activeHotspot === hotspot.id ? null : hotspot.id);
                      }}
                    >
                      <span className="relative flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A31F24] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-[#A31F24] border-2 border-white flex items-center justify-center text-[9px] font-black text-white">
                          +
                        </span>
                      </span>
                      
                      <AnimatePresence>
                        {activeHotspot === hotspot.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute bottom-7 left-1/2 transform -translate-x-1/2 w-48 p-3 bg-white/95 backdrop-blur-md border border-gray-150 rounded-xl shadow-xl z-30 pointer-events-auto"
                          >
                            <p className="text-[10px] font-black text-gray-900 uppercase tracking-wide">{hotspot.title}</p>
                            <p className="text-[9px] text-gray-500 font-medium mt-1 leading-relaxed">{hotspot.desc}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
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

              {primaryProduct.rating && primaryProduct.rating > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={16} fill={i < Math.round(primaryProduct.rating || 0) ? 'currentColor' : 'none'} className={i < Math.round(primaryProduct.rating || 0) ? 'text-amber-400' : 'text-gray-200'} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 font-medium font-sans">
                    ({primaryProduct.numReviews || 0} reviews)
                  </span>
                </div>
              )}

              {primaryProduct.description && (
                <p className="text-sm text-gray-600 leading-relaxed font-bengali">
                  {primaryProduct.description}
                </p>
              )}

              {/* Size & Color Selector */}
              {primaryProduct.variants && primaryProduct.variants.length > 0 && (
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-500">
                      Size: <span className="text-gray-900">{selectedSizes[primaryProduct._id] || 'Select'}</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[...new Set(primaryProduct.variants.map((v) => v.size))].map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSizes({ ...selectedSizes, [primaryProduct._id]: size })}
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

                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-500">
                      Color: <span className="text-gray-900">{selectedColors[primaryProduct._id] || 'Select'}</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[...new Set(primaryProduct.variants.map((v) => v.color))].map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColors({ ...selectedColors, [primaryProduct._id]: color })}
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
              {products.map((product) => {
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

                      <div className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                        <Image
                          src={productImage}
                          alt={product.title}
                          fill
                          sizes="80px"
                          className="object-cover object-top"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 truncate">{product.title}</h3>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">{product.category}</p>

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

        {/* ── Embedded Direct Checkout Form ── */}
        <div id="lp-checkout-form" className="bg-white border border-gray-100 rounded-2xl p-6 shadow-md scroll-mt-24 space-y-6">
          <div className="border-b border-gray-100 pb-4 text-center">
            <span className="bg-[#A31F24]/5 text-[#A31F24] px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-2">
              Confirm Your Order
            </span>
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-wider">
              হাতে পেয়ে টাকা পরিশোধ করুন (Cash on Delivery)
            </h3>
            <p className="text-[11px] text-gray-500 mt-1">
              অর্ডারটি সম্পন্ন করতে নিচের ফর্মটি পূরণ করুন
            </p>
          </div>

          {formError && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-xs font-semibold px-4 py-3 rounded-xl">
              {formError}
            </div>
          )}

          <form onSubmit={handlePlaceDirectOrder} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-500 flex items-center gap-1.5">
                <User size={13} /> Your Name *
              </label>
              <input
                type="text"
                required
                placeholder="আপনার নাম লিখুন"
                value={shippingInfo.name}
                onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-gray-900 focus:bg-white transition-all font-medium text-gray-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-500 flex items-center gap-1.5">
                <Phone size={13} /> Phone Number *
              </label>
              <input
                type="tel"
                required
                placeholder="মোবাইল নাম্বার লিখুন (যেমন: 017XXXXXXXX)"
                value={shippingInfo.phone}
                onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-gray-900 focus:bg-white transition-all font-medium text-gray-900"
              />
              {phoneError && <p className="text-[10px] text-red-500 font-bold">{phoneError}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-500 flex items-center gap-1.5">
                  <MapPin size={13} /> City / District *
                </label>
                <select
                  value={shippingInfo.city}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-gray-900 focus:bg-white transition-all font-bold text-gray-900 uppercase"
                >
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-500 flex items-center gap-1.5">
                  <Mail size={13} /> Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="ইমেইল এড্রেস (ঐচ্ছিক)"
                  value={shippingInfo.email}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-gray-900 focus:bg-white transition-all font-medium text-gray-900"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-500 flex items-center gap-1.5">
                <MapPin size={13} /> Detailed Delivery Address *
              </label>
              <textarea
                required
                rows={2}
                placeholder="আপনার বিস্তারিত ঠিকানা লিখুন (যেমন: বাসা/রোড/সেক্টর ইত্যাদি)"
                value={shippingInfo.address}
                onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-gray-900 focus:bg-white transition-all font-medium text-gray-900 resize-none"
              />
            </div>

            {/* Pricing Details */}
            <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 space-y-2">
              <div className="flex justify-between items-center text-[11px] text-gray-500 font-bold uppercase">
                <span>Selected Items ({selectedCount})</span>
                <span>৳{(totalPrice + comboDiscount).toLocaleString()}</span>
              </div>
              {comboDiscount > 0 && (
                <div className="flex justify-between items-center text-[11px] text-emerald-600 font-bold uppercase">
                  <span>Combo Discount</span>
                  <span>-৳{comboDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-[11px] text-gray-500 font-bold uppercase">
                <span>Delivery Cost ({shippingInfo.city})</span>
                <span>{getShippingCost() === 0 ? 'FREE' : `৳${getShippingCost()}`}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-900 font-black uppercase pt-2 border-t border-gray-200">
                <span>Total Payable</span>
                <span className="text-[#A31F24] text-sm">৳{(totalPrice + getShippingCost()).toLocaleString()}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isOrdering}
              className="w-full bg-[#A31F24] hover:bg-[#8D181D] hover:scale-[1.01] active:scale-[0.98] text-white py-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-0.5 shadow-[0_6px_20px_rgba(163,31,36,0.3)] hover:shadow-[0_8px_25px_rgba(163,31,36,0.45)] font-sans"
            >
              {isOrdering ? (
                <div className="flex items-center gap-2 py-0.5">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-xs font-black uppercase tracking-wider">Placing Your Order...</span>
                </div>
              ) : (
                <>
                  <span className="flex items-center gap-1.5 font-black text-sm tracking-[0.05em] leading-none">
                    <CheckCircle2 size={16} className="shrink-0" />
                    CONFIRM ORDER — ৳{(totalPrice + getShippingCost()).toLocaleString()}
                  </span>
                  <span className="text-[9px] font-bold text-white/80 lowercase tracking-wide font-bengali leading-none mt-1">
                    হাতে পেয়ে মূল্য দিন (Cash on Delivery)
                  </span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* ── Collapsible FAQ Accordion ── */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <HelpCircle size={18} className="text-[#A31F24]" /> Frequently Asked Questions (জিজ্ঞাসিত প্রশ্নাবলী)
          </h3>
          <div className="divide-y divide-gray-100">
            {FAQ_ITEMS.map((faq, idx) => (
              <div key={idx} className="py-3">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left py-2 font-bold text-xs sm:text-sm text-gray-800 hover:text-[#A31F24] transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                
                <AnimatePresence initial={false}>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed pt-1.5 pb-2 font-medium font-bengali">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

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
        onCtaClick={handleScrollToForm}
        disabled={disabled}
        totalPrice={totalPrice}
        shippingCost={getShippingCost()}
      />
    </div>
  );
}
