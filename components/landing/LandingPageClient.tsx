'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Clock,
  ShoppingBag,
  Check,
  Package,
  Truck,
  ShieldCheck,
  MapPin,
  User,
  Phone,
  Mail,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Plus,
  Minus,
  Trash2,
  X,
} from 'lucide-react';
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
  variants?: Array<{
    size: string;
    color: string;
    stock: number;
    price?: number;
    offerPrice?: number;
    image?: { url: string; public_id?: string };
  }>;
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

interface MainOrderItem {
  id: string;
  size: string;
  color: string;
  quantity: number;
}

interface AddOnOrderItem {
  productId: string;
  title: string;
  price: number;
  image: string;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
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

// Helper to collect all images for a product (from product.images + variant images)
function getProductImages(product: ProductData | null, fallbackHero?: string): string[] {
  if (!product) return fallbackHero ? [fallbackHero] : ['/images/placeholder.jpg'];
  const list: string[] = [];
  if (product.images && product.images.length > 0) {
    product.images.forEach((img) => {
      if (img?.url) list.push(getDirectImageLink(img.url));
    });
  }
  if (product.variants && product.variants.length > 0) {
    product.variants.forEach((v) => {
      if (v.image?.url) {
        const direct = getDirectImageLink(v.image.url);
        if (!list.includes(direct)) {
          list.push(direct);
        }
      }
    });
  }
  if (list.length === 0) {
    if (fallbackHero) list.push(fallbackHero);
    else list.push('/images/placeholder.jpg');
  }
  return list;
}

// Helper to find image URL for a given color variant
function getVariantImageForColor(product: ProductData | null, color: string): string | null {
  if (!product || !product.variants) return null;
  const match = product.variants.find((v) => v.color.toLowerCase() === color.toLowerCase() && v.image?.url);
  if (match?.image?.url) {
    return getDirectImageLink(match.image.url);
  }
  return null;
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
          className="bg-[#A31F24] hover:bg-[#8D181D] hover:scale-[1.02] active:scale-[0.97] text-white py-3 px-8 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-0.5 shadow-[0_6px_20px_rgba(163,31,36,0.3)] hover:shadow-[0_8px_25px_rgba(163,31,36,0.45)] w-full sm:w-auto font-sans cursor-pointer"
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

// ── FB Pixel tracking helper ──
function trackFbEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    try {
      (window as any).fbq('track', eventName, params);
    } catch (e) {
      console.warn('[FB Pixel] Tracking warning:', e);
    }
  }
}

// ── LP Analytics helper ──
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
  const [suggestedProducts, setSuggestedProducts] = useState<ProductData[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const suggestedScrollRef = useRef<HTMLDivElement>(null);

  const scrollSuggestions = (direction: 'left' | 'right') => {
    if (suggestedScrollRef.current) {
      const scrollAmount = direction === 'left' ? -270 : 270;
      suggestedScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Modal Product State
  const [detailProduct, setDetailProduct] = useState<ProductData | null>(null);
  const [modalSize, setModalSize] = useState<string>('');
  const [modalColor, setModalColor] = useState<string>('');
  const [modalQuantity, setModalQuantity] = useState<number>(1);
  const [modalImageIdx, setModalImageIdx] = useState<number>(0);

  const products = useMemo(() => {
    return (page.productIds || []).filter((p): p is ProductData =>
      p !== null && typeof p === 'object' && '_id' in p
    );
  }, [page.productIds]);

  const isSingle = page.layoutType === 'single-product';
  const primaryProduct = isSingle ? products[0] : null;

  // Single Product Main Items (supports adding multiple sizes/colors of the main product)
  const defaultSize = primaryProduct?.variants?.[0]?.size || 'M';
  const defaultColor = primaryProduct?.variants?.[0]?.color || 'Black';

  const [mainItems, setMainItems] = useState<MainOrderItem[]>([
    { id: 'main-1', size: defaultSize, color: defaultColor, quantity: 1 },
  ]);

  // Add-on products selected for order
  const [addOnItems, setAddOnItems] = useState<Record<string, AddOnOrderItem>>({});

  // Multi-product selections map for non-single layout
  const [multiProductSelections, setMultiProductSelections] = useState<Record<string, { size: string; color: string; quantity: number }>>(() => {
    const initial: Record<string, { size: string; color: string; quantity: number }> = {};
    if (!isSingle) {
      products.forEach((p) => {
        initial[p._id] = {
          size: p.variants?.[0]?.size || 'M',
          color: p.variants?.[0]?.color || 'Black',
          quantity: 1,
        };
      });
    }
    return initial;
  });
  const [multiProductActive, setMultiProductActive] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (!isSingle) {
      products.forEach((p) => {
        initial[p._id] = true;
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

  // Load suggestions
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          const lpProductIds = new Set((page.productIds || []).map((p) => p._id));
          const filtered = data.products
            .filter((p: any) => !lpProductIds.has(p._id))
            .slice(0, 4);
          setSuggestedProducts(filtered);
        }
      } catch (err) {
        console.error('Failed to load suggestions:', err);
      } finally {
        setLoadingSuggestions(false);
      }
    };
    loadSuggestions();
  }, [page.productIds]);

  // Fetch settings & track view
  useEffect(() => {
    setMounted(true);
    fetchSettings();
    trackLpEvent(page.slug, 'pageview');
    trackFbEvent('ViewContent', {
      content_name: page.pageTitle,
      content_category: 'LandingPage',
      currency: 'BDT',
    });
    try {
      sessionStorage.setItem('loomra_campaign_slug', page.slug);
    } catch {}
  }, [page.slug, page.pageTitle, fetchSettings]);

  // Initialize/reset modal state when detailProduct changes
  useEffect(() => {
    if (detailProduct) {
      const firstV = detailProduct.variants?.[0];
      setModalSize(firstV?.size || 'M');
      setModalColor(firstV?.color || 'Standard');
      setModalQuantity(1);
      setModalImageIdx(0);
    }
  }, [detailProduct]);

  // Main product combined image gallery list
  const primaryProductImages = useMemo(() => {
    return getProductImages(primaryProduct, page.customHero?.customBannerImage);
  }, [primaryProduct, page.customHero?.customBannerImage]);

  const desktopHeroImage = useMemo(() => {
    return (
      (page.customHero?.customBannerImage && getDirectImageLink(page.customHero.customBannerImage.trim())) ||
      primaryProductImages[activeImage] ||
      '/images/placeholder.jpg'
    );
  }, [page.customHero, primaryProductImages, activeImage]);

  const mobileHeroImage = useMemo(() => {
    return (
      (page.customHero?.customMobileBannerImage && getDirectImageLink(page.customHero.customMobileBannerImage.trim())) ||
      desktopHeroImage
    );
  }, [page.customHero, desktopHeroImage]);

  const heroImage = desktopHeroImage;
  const heading = page.customHero?.customHeading?.trim() || primaryProduct?.title || page.pageTitle;
  const subheading = page.customHero?.customSubheading?.trim() || primaryProduct?.description || '';
  const hasCountdown = page.promotionalElements?.countdownTimerToggle && page.promotionalElements?.countdownTargetDate;
  const announcementText = page.promotionalElements?.announcementText;
  const testimonials = page.socialProof || [];

  // Handle color change on main product: update color state & switch gallery image if variant image exists
  const handleMainColorChange = (index: number, newColor: string) => {
    const updated = [...mainItems];
    updated[index].color = newColor;
    setMainItems(updated);

    if (primaryProduct) {
      const varImg = getVariantImageForColor(primaryProduct, newColor);
      if (varImg) {
        const imgIdx = primaryProductImages.indexOf(varImg);
        if (imgIdx !== -1) {
          setActiveImage(imgIdx);
        }
      }
    }
  };

  // Add another variant item for main product
  const handleAddMainVariantItem = () => {
    const nextId = 'main-' + Date.now();
    setMainItems((prev) => [
      ...prev,
      { id: nextId, size: defaultSize, color: defaultColor, quantity: 1 },
    ]);
  };

  // Remove main variant item
  const handleRemoveMainVariantItem = (id: string) => {
    if (mainItems.length <= 1) return;
    setMainItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Total items quantity count
  const selectedCount = useMemo(() => {
    let count = 0;
    if (isSingle) {
      mainItems.forEach((i) => (count += i.quantity));
    } else {
      products.forEach((p) => {
        if (multiProductActive[p._id]) {
          count += multiProductSelections[p._id]?.quantity || 1;
        }
      });
    }
    Object.values(addOnItems).forEach((item) => {
      count += item.quantity;
    });
    return count;
  }, [isSingle, mainItems, products, multiProductActive, multiProductSelections, addOnItems]);

  // Combo Discount calculation
  const comboDiscount = useMemo(() => {
    const settings = page.offerSettings;
    if (!settings?.comboDiscountToggle) return 0;

    if (selectedCount >= (settings.comboMinQty ?? 2)) {
      let subtotal = 0;
      if (isSingle && primaryProduct) {
        const unitPrice = primaryProduct.offerPrice || primaryProduct.basePrice;
        mainItems.forEach((i) => (subtotal += unitPrice * i.quantity));
      } else {
        products.forEach((p) => {
          if (multiProductActive[p._id]) {
            const qty = multiProductSelections[p._id]?.quantity || 1;
            subtotal += (p.offerPrice || p.basePrice) * qty;
          }
        });
      }
      Object.values(addOnItems).forEach((i) => (subtotal += i.price * i.quantity));

      if (settings.comboDiscountType === 'percentage') {
        return Math.round((subtotal * (settings.comboDiscountValue ?? 0)) / 100);
      } else {
        return settings.comboDiscountValue ?? 0;
      }
    }
    return 0;
  }, [page.offerSettings, selectedCount, isSingle, primaryProduct, mainItems, products, multiProductActive, multiProductSelections, addOnItems]);

  const totalPrice = useMemo(() => {
    let total = 0;
    if (isSingle && primaryProduct) {
      const unitPrice = primaryProduct.offerPrice || primaryProduct.basePrice;
      mainItems.forEach((i) => (total += unitPrice * i.quantity));
    } else {
      products.forEach((p) => {
        if (multiProductActive[p._id]) {
          const qty = multiProductSelections[p._id]?.quantity || 1;
          total += (p.offerPrice || p.basePrice) * qty;
        }
      });
    }
    Object.values(addOnItems).forEach((i) => (total += i.price * i.quantity));
    return Math.max(0, total - comboDiscount);
  }, [isSingle, primaryProduct, mainItems, products, multiProductActive, multiProductSelections, addOnItems, comboDiscount]);

  const totalOriginalPrice = useMemo(() => {
    let total = 0;
    if (isSingle && primaryProduct) {
      mainItems.forEach((i) => (total += primaryProduct.basePrice * i.quantity));
    } else {
      products.forEach((p) => {
        if (multiProductActive[p._id]) {
          const qty = multiProductSelections[p._id]?.quantity || 1;
          total += p.basePrice * qty;
        }
      });
    }
    return total;
  }, [isSingle, primaryProduct, mainItems, products, multiProductActive, multiProductSelections]);

  const savings = totalOriginalPrice - totalPrice;
  const hasSavings = savings > 0;

  const isShippingFree = useCallback(() => {
    const pageShipping = page.offerSettings;
    if (pageShipping?.freeShippingToggle) {
      const minQty = pageShipping.freeShippingMinQty ?? 0;
      const minAmt = pageShipping.freeShippingMinAmount ?? 0;
      if (minQty === 0 && minAmt === 0) return true;
      const meetsQty = minQty > 0 ? selectedCount >= minQty : true;
      const meetsAmt = minAmt > 0 ? totalPrice >= minAmt : true;
      if (meetsQty && meetsAmt) return true;
    }

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
      const defaultImg = primaryProductImages[0] || '/images/placeholder.jpg';
      mainItems.forEach((item) => {
        const varImg = getVariantImageForColor(primaryProduct, item.color) || defaultImg;
        orderItems.push({
          title: primaryProduct.title,
          price: primaryProduct.offerPrice || primaryProduct.basePrice,
          image: varImg,
          selectedSize: item.size,
          selectedColor: item.color,
          quantity: item.quantity,
        });
      });
    } else {
      products.forEach((p) => {
        if (multiProductActive[p._id]) {
          const sel = multiProductSelections[p._id] || { size: 'M', color: 'Black', quantity: 1 };
          const imgUrl = getVariantImageForColor(p, sel.color) || p.images?.[0]?.url || '/images/placeholder.jpg';
          orderItems.push({
            title: p.title,
            price: p.offerPrice || p.basePrice,
            image: getDirectImageLink(imgUrl),
            selectedSize: sel.size,
            selectedColor: sel.color,
            quantity: sel.quantity,
          });
        }
      });
    }

    // Add any add-on items
    Object.values(addOnItems).forEach((addon) => {
      orderItems.push(addon);
    });

    if (orderItems.length === 0) {
      setFormError('Please select at least one product item to order');
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
        trackFbEvent('Purchase', {
          value: finalTotal,
          currency: 'BDT',
          content_type: 'product',
          num_items: selectedCount,
        });
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
            <p className="text-[11px] text-gray-500 font-bengali">
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
      {/* ── Brand Header ── */}
      <header className="bg-white border-b border-gray-100 py-4 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            {settings?.logo ? (
              <img
                src={getDirectImageLink(settings.logo)}
                alt="AS SIDRAT Logo"
                className="h-10 sm:h-12 w-auto object-contain"
              />
            ) : (
              <div className="w-10 h-10 bg-[#A31F24] rounded-xl flex items-center justify-center text-white font-black text-xl">
                S
              </div>
            )}
            <div>
              <span className="text-sm sm:text-base font-black tracking-widest text-slate-900 block leading-tight">
                AS SIDRAT
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                Premium Fashion
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-wider bg-red-50 text-[#A31F24] border border-red-100 px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A31F24]"></span> Special Offer
            </span>
          </div>
        </div>
      </header>

      {/* ── Announcement Bar ── */}
      {announcementText && (
        <div className="bg-slate-900 text-white text-xs sm:text-sm font-semibold py-2.5 px-4 text-center font-bengali shadow-sm">
          <span className="inline-flex items-center justify-center gap-2 flex-wrap max-w-xl mx-auto leading-normal">
            <Truck size={16} className="text-emerald-400 shrink-0" />
            <span>{announcementText}</span>
          </span>
        </div>
      )}

      {/* ── Hero Banner Section ── */}
      <div className="relative bg-slate-950 overflow-hidden">
        <div className="aspect-[4/3] sm:aspect-[4/2] md:aspect-[21/9] relative">
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
          {/* Strong Gradient Overlay for crisp text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent pointer-events-none" />

          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-6 md:p-10 max-w-xl mx-auto z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center bg-slate-950/80 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-6 shadow-2xl"
            >
              {subheading && (
                <div className="mb-2">
                  <span className="inline-block px-3 py-1 bg-[#A31F24] text-white font-bold text-xs sm:text-sm rounded-full font-bengali shadow-xs leading-tight">
                    {subheading}
                  </span>
                </div>
              )}
              <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-white font-bengali leading-snug tracking-normal drop-shadow-md">
                {heading}
              </h1>

              <div className="mt-3 flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                {hasSavings && (
                  <span className="text-xs sm:text-base text-slate-300 line-through font-bold">
                    ৳{totalOriginalPrice.toLocaleString()}
                  </span>
                )}
                <span className={`font-black px-3.5 py-1 rounded-xl border shadow-sm ${
                  hasSavings 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-lg sm:text-2xl' 
                    : 'bg-white/10 text-white border-white/20 text-base sm:text-xl'
                }`}>
                  ৳{totalPrice.toLocaleString()}
                </span>
                {hasSavings && (
                  <span className="bg-red-500/20 text-red-300 border border-red-500/30 px-2.5 py-1 rounded-lg text-xs font-bold font-bengali">
                    সাশ্রয় ৳{savings.toLocaleString()}
                  </span>
                )}
              </div>
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

      {/* ── Main Content Container ── */}
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10 space-y-8">

        {/* ── Single Product Layout ── */}
        {isSingle && primaryProduct && (
          <div className="space-y-6">
            {/* Image Gallery with thumbnails and hotspots */}
            <div className="space-y-3">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 group shadow-sm">
                <Image
                  src={primaryProductImages[activeImage] || heroImage}
                  alt={primaryProduct.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 600px"
                  className="object-cover object-top transition-all duration-300"
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

              {primaryProductImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {primaryProductImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`relative w-16 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        activeImage === idx ? 'border-gray-900 opacity-100 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={imgUrl}
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

            {/* Product Info */}
            <div className="space-y-4">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-wider">
                {primaryProduct.title}
              </h2>

              {(primaryProduct.rating ?? 0) > 0 && (
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

              {/* Multi-Item / Multi-Variant Order Builder */}
              <div className="space-y-4 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-900">
                    Select Size & Color (সাইজ ও কালার সিলেক্ট করুন)
                  </span>
                  <span className="text-[10px] font-bold text-[#A31F24] bg-red-50 px-2 py-0.5 rounded-md">
                    {mainItems.length} Item{mainItems.length > 1 ? 's' : ''} Selected
                  </span>
                </div>

                {mainItems.map((item, idx) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3 relative">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                        Item #{idx + 1}
                      </span>
                      {mainItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMainVariantItem(item.id)}
                          className="text-gray-400 hover:text-red-600 p-1 rounded-md transition-colors"
                          title="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    {/* Size Selector */}
                    {primaryProduct.variants && primaryProduct.variants.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-500">
                          Size: <span className="text-gray-900">{item.size}</span>
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {[...new Set(primaryProduct.variants.map((v) => v.size))].map((size) => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => {
                                const updated = [...mainItems];
                                updated[idx].size = size;
                                setMainItems(updated);
                              }}
                              className={`min-w-[44px] min-h-[44px] px-3 py-2 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer ${
                                item.size === size
                                  ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400 active:scale-[0.95]'
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Color Selector */}
                    {primaryProduct.variants && primaryProduct.variants.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-500">
                          Color: <span className="text-gray-900">{item.color}</span>
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {[...new Set(primaryProduct.variants.map((v) => v.color))].map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => handleMainColorChange(idx, color)}
                              className={`px-3.5 py-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                                item.color === color
                                  ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 active:scale-[0.97]'
                              }`}
                            >
                              {color}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quantity Stepper */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-500">
                        Quantity:
                      </span>
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...mainItems];
                            updated[idx].quantity = Math.max(1, updated[idx].quantity - 1);
                            setMainItems(updated);
                          }}
                          className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-200 active:scale-95 transition-all"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center text-xs font-black text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...mainItems];
                            updated[idx].quantity += 1;
                            setMainItems(updated);
                          }}
                          className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-200 active:scale-95 transition-all"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add another size/color variant button */}
                <button
                  type="button"
                  onClick={handleAddMainVariantItem}
                  className="w-full py-3 border-2 border-dashed border-gray-300 hover:border-gray-900 text-gray-700 hover:text-gray-900 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 bg-gray-50/50 hover:bg-white cursor-pointer"
                >
                  <Plus size={16} className="text-[#A31F24]" />
                  + আরেকটি কালার বা সাইজ যোগ করুন (Add Another Variant)
                </button>
              </div>

              {/* Pricing Block */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-5 flex justify-between items-center mt-2">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-450 block">
                    Special Price (বিশেষ মূল্য)
                  </span>
                  <div className="flex items-baseline gap-2.5 mt-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-[#A31F24] tracking-tight">
                      ৳{(primaryProduct.offerPrice || primaryProduct.basePrice).toLocaleString()}
                    </span>
                    {primaryProduct.offerPrice && primaryProduct.offerPrice < primaryProduct.basePrice && (
                      <span className="text-xs sm:text-sm text-slate-400 line-through font-bold">
                        ৳{primaryProduct.basePrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                {primaryProduct.offerPrice && primaryProduct.offerPrice < primaryProduct.basePrice && (
                  <div className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-sm">
                    Save ৳{(primaryProduct.basePrice - primaryProduct.offerPrice).toLocaleString()}
                  </div>
                )}
              </div>

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
                <Package size={20} /> Select Products in Bundle
              </h2>
              <span className="text-xs font-bold text-gray-400">
                {selectedCount} item(s) selected
              </span>
            </div>

            <div className="space-y-3">
              {products.map((product) => {
                const isSelected = multiProductActive[product._id] ?? true;
                const sel = multiProductSelections[product._id] || { size: 'M', color: 'Black', quantity: 1 };
                const productImage = getVariantImageForColor(product, sel.color) || product.images?.[0]?.url || '/images/placeholder.jpg';

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
                        type="button"
                        onClick={() =>
                          setMultiProductActive({
                            ...multiProductActive,
                            [product._id]: !isSelected,
                          })
                        }
                        className={`mt-1 w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                          isSelected ? 'bg-gray-900 border-gray-900' : 'border-gray-300'
                        }`}
                      >
                        {isSelected && (
                          <Check size={14} className="text-white" strokeWidth={3} />
                        )}
                      </button>

                      <div className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                        <Image
                          src={getDirectImageLink(productImage)}
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
                          <div className="flex flex-wrap gap-2 mt-2">
                            <select
                              value={sel.size}
                              onChange={(e) =>
                                setMultiProductSelections({
                                  ...multiProductSelections,
                                  [product._id]: { ...sel, size: e.target.value },
                                })
                              }
                              className="text-[9px] font-bold uppercase border border-gray-200 rounded-lg px-2 py-1.5 bg-white outline-none focus:border-gray-900"
                            >
                              {[...new Set(product.variants.map((v) => v.size))].map((s) => (
                                <option key={s} value={s}>Size: {s}</option>
                              ))}
                            </select>
                            <select
                              value={sel.color}
                              onChange={(e) =>
                                setMultiProductSelections({
                                  ...multiProductSelections,
                                  [product._id]: { ...sel, color: e.target.value },
                                })
                              }
                              className="text-[9px] font-bold uppercase border border-gray-200 rounded-lg px-2 py-1.5 bg-white outline-none focus:border-gray-900"
                            >
                              {[...new Set(product.variants.map((v) => v.color))].map((c) => (
                                <option key={c} value={c}>Color: {c}</option>
                              ))}
                            </select>
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                              <button
                                type="button"
                                onClick={() =>
                                  setMultiProductSelections({
                                    ...multiProductSelections,
                                    [product._id]: { ...sel, quantity: Math.max(1, sel.quantity - 1) },
                                  })
                                }
                                className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                              >
                                <Minus size={10} />
                              </button>
                              <span className="px-2 text-[10px] font-bold">{sel.quantity}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setMultiProductSelections({
                                    ...multiProductSelections,
                                    [product._id]: { ...sel, quantity: sel.quantity + 1 },
                                  })
                                }
                                className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                              >
                                <Plus size={10} />
                              </button>
                            </div>
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
          </div>
        )}

        {/* ── Suggested / Add-on Products ── */}
        {suggestedProducts.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={16} className="text-amber-500 shrink-0" />
                  <span>Special Add-on Offers (স্পেশাল অফার)</span>
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 ml-1">
                    {suggestedProducts.length}
                  </span>
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5 font-bengali">
                  অর্ডারের সাথে আরও কিছু প্রোডাক্ট যোগ করুন এবং অতিরিক্ত ডিসকাউন্ট উপভোগ করুন:
                </p>
              </div>

              {/* Carousel Scroll Controls */}
              {suggestedProducts.length > 1 && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => scrollSuggestions('left')}
                    className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-all cursor-pointer border border-gray-200 active:scale-95"
                    title="Previous offer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollSuggestions('right')}
                    className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-all cursor-pointer border border-gray-200 active:scale-95"
                    title="Next offer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Horizontal Scroll Carousel */}
            <div
              ref={suggestedScrollRef}
              className="flex gap-3 overflow-x-auto pb-2 pt-1 custom-scrollbar snap-x snap-mandatory scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0"
            >
              {suggestedProducts.map((p) => {
                const isAdded = !!addOnItems[p._id];
                const pImages = getProductImages(p);

                return (
                  <div
                    key={p._id}
                    className={`w-[82vw] max-w-[270px] sm:w-[280px] shrink-0 snap-start rounded-2xl p-3 shadow-xs transition-all flex flex-col justify-between border ${
                      isAdded
                        ? 'bg-emerald-50/40 border-emerald-400 ring-1 ring-emerald-400/20'
                        : 'bg-white border-gray-200/80 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div
                      onClick={() => setDetailProduct(p)}
                      className="flex gap-3 cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                        <img
                          src={pImages[0]}
                          alt={p.title}
                          className="w-full h-full object-cover object-top"
                        />
                        {isAdded && (
                          <div className="absolute top-1 right-1 bg-emerald-600 text-white rounded-full p-0.5 shadow-sm">
                            <CheckCircle2 size={12} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 flex flex-col justify-center">
                        <span className="text-[9px] font-black uppercase text-amber-600 tracking-wider">Add-on Deal</span>
                        <h4 className="text-xs font-bold text-gray-900 truncate mt-0.5" title={p.title}>{p.title}</h4>
                        <p className="text-[9px] text-gray-400 uppercase mt-0.5">{p.category}</p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="text-xs font-black text-gray-900">
                            ৳{(p.offerPrice || p.basePrice).toLocaleString()}
                          </span>
                          {p.offerPrice && p.offerPrice < p.basePrice && (
                            <span className="text-[10px] text-gray-400 line-through">
                              ৳{p.basePrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Add / View Details */}
                    <div className="flex gap-1.5 pt-2.5 mt-2 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setDetailProduct(p)}
                        className="flex-1 py-1.5 px-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-gray-200 text-gray-700 hover:border-gray-900 hover:bg-gray-50 transition-all text-center cursor-pointer truncate"
                      >
                        Options
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (isAdded) {
                            const copy = { ...addOnItems };
                            delete copy[p._id];
                            setAddOnItems(copy);
                          } else {
                            const size = p.variants?.[0]?.size || 'M';
                            const color = p.variants?.[0]?.color || 'Black';
                            const img = getVariantImageForColor(p, color) || pImages[0];
                            setAddOnItems({
                              ...addOnItems,
                              [p._id]: {
                                productId: p._id,
                                title: p.title,
                                price: p.offerPrice || p.basePrice,
                                image: img,
                                selectedSize: size,
                                selectedColor: color,
                                quantity: 1,
                              },
                            });
                          }
                        }}
                        className={`py-1.5 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0 ${
                          isAdded
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                            : 'bg-gray-900 text-white hover:bg-gray-800'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <CheckCircle2 size={12} />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <Plus size={12} />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
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
            <p className="text-[11px] text-gray-500 mt-1 font-bengali">
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
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-gray-900 focus:bg-white transition-all font-bold text-gray-900 uppercase cursor-pointer"
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

            {/* Selected Items Summary List in Checkout */}
            <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block border-b border-gray-200/60 pb-1.5">
                Order Items Summary ({selectedCount} item{selectedCount > 1 ? 's' : ''})
              </span>

              {isSingle && primaryProduct && (
                <div className="space-y-2">
                  {mainItems.map((item, idx) => (
                    <div key={item.id} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-4 text-[10px] text-gray-400 font-mono">{idx + 1}.</span>
                        <span className="font-bold text-gray-900 truncate">{primaryProduct.title}</span>
                        <span className="text-[10px] text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded font-mono">
                          {item.size} / {item.color}
                        </span>
                        <span className="text-[10px] text-gray-600 font-bold">×{item.quantity}</span>
                      </div>
                      <span className="font-bold text-gray-900">
                        ৳{((primaryProduct.offerPrice || primaryProduct.basePrice) * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {Object.values(addOnItems).length > 0 && (
                <div className="space-y-2 pt-1 border-t border-gray-200/60">
                  <span className="text-[9px] font-black uppercase text-amber-600 block">Add-on Products:</span>
                  {Object.values(addOnItems).map((addon) => (
                    <div key={addon.productId} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-gray-900 truncate">{addon.title}</span>
                        <span className="text-[10px] text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded font-mono">
                          {addon.selectedSize} / {addon.selectedColor}
                        </span>
                        <span className="text-[10px] text-gray-600 font-bold">×{addon.quantity}</span>
                      </div>
                      <span className="font-bold text-gray-900">
                        ৳{(addon.price * addon.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-gray-200 space-y-1.5">
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
                  <span className="text-[#A31F24] text-base">৳{(totalPrice + getShippingCost()).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isOrdering}
              className="w-full bg-[#A31F24] hover:bg-[#8D181D] hover:scale-[1.01] active:scale-[0.98] text-white py-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-0.5 shadow-[0_6px_20px_rgba(163,31,36,0.3)] hover:shadow-[0_8px_25px_rgba(163,31,36,0.45)] font-sans cursor-pointer"
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
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left py-2 font-bold text-xs sm:text-sm text-gray-800 hover:text-[#A31F24] transition-colors cursor-pointer"
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

      {/* ── Interactive Product Detail Modal ── */}
      <AnimatePresence>
        {detailProduct && (() => {
          const modalImages = getProductImages(detailProduct);
          const modalVariants = detailProduct.variants || [];
          const modalSizes = [...new Set(modalVariants.map((v) => v.size))];
          const modalColors = [...new Set(modalVariants.map((v) => v.color))];

          const handleModalColorChange = (c: string) => {
            setModalColor(c);
            const varImg = getVariantImageForColor(detailProduct, c);
            if (varImg) {
              const idx = modalImages.indexOf(varImg);
              if (idx !== -1) setModalImageIdx(idx);
            }
          };

          const isAddedInAddons = !!addOnItems[detailProduct._id];

          return (
            <div
              onClick={() => setDetailProduct(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh]"
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setDetailProduct(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-700 flex items-center justify-center transition-all z-20 shadow-md border border-gray-100 cursor-pointer"
                >
                  <X size={18} />
                </button>

                {/* Scrollable Content */}
                <div className="overflow-y-auto flex-1">
                  {/* Image Gallery */}
                  <div className="relative aspect-[4/3] w-full bg-slate-50 border-b border-gray-100">
                    <img
                      src={modalImages[modalImageIdx] || modalImages[0]}
                      alt={detailProduct.title}
                      className="w-full h-full object-cover object-top transition-all duration-300"
                    />
                    <div className="absolute top-4 left-4 bg-[#A31F24] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
                      {detailProduct.category}
                    </div>

                    {modalImages.length > 1 && (
                      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 px-4">
                        {modalImages.map((imgUrl, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setModalImageIdx(i)}
                            className={`w-3 h-3 rounded-full border border-white transition-all cursor-pointer ${
                              modalImageIdx === i ? 'bg-[#A31F24] scale-110' : 'bg-white/70'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Details & Selectors */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-base font-black text-gray-900 leading-snug">
                        {detailProduct.title}
                      </h3>

                      <div className="flex items-center gap-2.5 mt-2">
                        <span className="text-lg font-black text-[#A31F24]">
                          ৳{(detailProduct.offerPrice || detailProduct.basePrice).toLocaleString()}
                        </span>
                        {detailProduct.offerPrice && detailProduct.offerPrice < detailProduct.basePrice && (
                          <span className="text-xs text-gray-400 line-through font-semibold">
                            ৳{detailProduct.basePrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Interactive Size Selector */}
                    {modalSizes.length > 0 && (
                      <div className="space-y-2 border-t border-gray-100 pt-4">
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
                          Select Size: <span className="text-gray-900">{modalSize}</span>
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {modalSizes.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setModalSize(s)}
                              className={`min-w-[40px] px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                modalSize === s
                                  ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Interactive Color Selector */}
                    {modalColors.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
                          Select Color: <span className="text-gray-900">{modalColor}</span>
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {modalColors.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => handleModalColorChange(c)}
                              className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                                modalColor === c
                                  ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Interactive Quantity Stepper */}
                    <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                        Quantity:
                      </span>
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                        <button
                          type="button"
                          onClick={() => setModalQuantity((q) => Math.max(1, q - 1))}
                          className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-200"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center text-xs font-black text-gray-900">
                          {modalQuantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setModalQuantity((q) => q + 1)}
                          className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-200"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    {detailProduct.description && (
                      <div className="space-y-1.5 border-t border-gray-100 pt-4">
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                          Product Details (বিস্তারিত বিবরণ)
                        </h4>
                        <p className="text-xs text-gray-600 font-medium leading-relaxed font-bengali whitespace-pre-line">
                          {detailProduct.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom CTA / Action Bar */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (isAddedInAddons) {
                        const copy = { ...addOnItems };
                        delete copy[detailProduct._id];
                        setAddOnItems(copy);
                      } else {
                        const varImg = getVariantImageForColor(detailProduct, modalColor) || modalImages[0];
                        setAddOnItems({
                          ...addOnItems,
                          [detailProduct._id]: {
                            productId: detailProduct._id,
                            title: detailProduct.title,
                            price: detailProduct.offerPrice || detailProduct.basePrice,
                            image: varImg,
                            selectedSize: modalSize || 'M',
                            selectedColor: modalColor || 'Standard',
                            quantity: modalQuantity,
                          },
                        });
                      }
                      setDetailProduct(null);
                    }}
                    className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
                      isAddedInAddons
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {isAddedInAddons ? (
                      <>
                        <Trash2 size={14} className="text-red-600" /> Remove From Order
                      </>
                    ) : (
                      <>
                        <Plus size={14} /> Add {modalQuantity} to Order
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
