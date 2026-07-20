'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, Smartphone, Tablet, Monitor, ExternalLink, Loader2, Star, Clock, Package, Truck, ShieldCheck, AlertCircle } from 'lucide-react';

// ── Types (matching LandingPageClient) ──
interface ProductPreview {
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

interface PageData {
  _id: string;
  pageTitle: string;
  slug: string;
  layoutType: 'single-product' | 'multi-product';
  productIds: (string | ProductPreview)[];
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

interface LandingPagePreviewModalProps {
  /** Either pass the full page data directly, or a pageId to fetch */
  page?: PageData;
  pageId?: string;
  onClose: () => void;
}

type DeviceView = 'mobile' | 'tablet' | 'desktop';

const DEVICE_WIDTHS: Record<DeviceView, string> = {
  mobile: 'max-w-[375px]',
  tablet: 'max-w-[768px]',
  desktop: 'max-w-[1024px]',
};

const DEVICE_ICONS: Record<DeviceView, React.ElementType> = {
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
};

const DEVICE_LABELS: Record<DeviceView, string> = {
  mobile: 'Mobile',
  tablet: 'Tablet',
  desktop: 'Desktop',
};

// ── Mini Landing Page Renderer (inside the iframe-like preview) ──
function MiniLandingPreview({ page }: { page: PageData }) {
  const products = (page.productIds || []).filter((p): p is ProductPreview => typeof p === 'object' && p !== null);
  const isSingle = page.layoutType === 'single-product';
  const primaryProduct = isSingle ? products[0] : null;

  const heading = page.customHero?.customHeading || primaryProduct?.title || page.pageTitle;
  const subheading = page.customHero?.customSubheading || primaryProduct?.description || '';
  const heroImage = page.customHero?.customBannerImage || products[0]?.images?.[0]?.url || '/images/placeholder.jpg';

  const totalPrice = isSingle
    ? (primaryProduct?.offerPrice || primaryProduct?.basePrice || 0)
    : products.reduce((sum, p) => sum + (p.offerPrice || p.basePrice), 0);

  const totalOriginal = isSingle
    ? (primaryProduct?.offerPrice ? primaryProduct.basePrice : 0)
    : products.reduce((sum, p) => sum + p.basePrice, 0);

  const hasSavings = totalOriginal > totalPrice;
  const hasCountdown = page.promotionalElements?.countdownTimerToggle && page.promotionalElements?.countdownTargetDate;
  const testimonials = page.socialProof || [];

  return (
    <div className="bg-[#FAFAFA] min-h-full">
      {/* Announcement Bar */}
      {page.promotionalElements?.announcementText && (
        <div className="bg-gray-900 text-white text-[9px] font-bold uppercase tracking-[0.2em] py-2 text-center">
          <span className="inline-flex items-center gap-1.5">
            <Truck size={12} className="text-emerald-400" />
            {page.promotionalElements.announcementText}
          </span>
        </div>
      )}

      {/* Hero */}
      <div className="relative bg-gray-100">
        <div className="aspect-[4/3] relative">
          <Image
            src={heroImage}
            alt={heading}
            fill
            sizes="(max-width: 768px) 100vw, 1024px"
            className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
            {subheading && (
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/80 mb-1">{subheading}</p>
            )}
            <h2 className="text-lg sm:text-xl font-black text-white uppercase leading-tight">{heading}</h2>
            <div className="mt-2 flex items-center justify-center gap-2">
              {hasSavings && (
                <span className="text-sm text-white/60 line-through font-bold">
                  ৳{totalOriginal.toLocaleString()}
                </span>
              )}
              <span className={`font-black ${hasSavings ? 'text-emerald-400 text-xl' : 'text-white text-lg'}`}>
                ৳{totalPrice.toLocaleString()}
              </span>
            </div>
            {hasSavings && (
              <p className="text-[9px] font-bold text-emerald-400 mt-0.5 uppercase tracking-wider">
                Save ৳{(totalOriginal - totalPrice).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Countdown */}
      {hasCountdown && (
        <div className="bg-white border-b border-gray-100 py-4">
          <div className="px-4 text-center">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2 flex items-center justify-center gap-1.5">
              <Clock size={12} /> Offer Ends In
            </p>
            <div className="flex items-center justify-center gap-2">
              {['Days', 'Hours', 'Mins', 'Secs'].map((label) => (
                <div key={label} className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-gray-900 text-white rounded-lg flex items-center justify-center text-sm font-black">
                    00
                  </div>
                  <span className="text-[8px] font-bold uppercase text-gray-500 mt-1 tracking-wider">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Products */}
      <div className="px-4 py-5 space-y-4">
        {isSingle && primaryProduct ? (
          <div className="space-y-4">
            {primaryProduct.images?.[0] && (
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                <Image src={primaryProduct.images[0].url} alt={primaryProduct.title} fill sizes="400px" className="object-cover object-top" />
              </div>
            )}
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase">{primaryProduct.title}</h3>
              {primaryProduct.description && (
                <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{primaryProduct.description}</p>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
              {[{ icon: Truck, label: 'Free Shipping' }, { icon: ShieldCheck, label: 'Secure' }, { icon: Package, label: 'Returns' }].map((item) => (
                <div key={item.label} className="text-center">
                  <item.icon size={14} className="mx-auto text-gray-400 mb-0.5" />
                  <p className="text-[8px] font-bold text-gray-500 uppercase tracking-wider">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <Package size={14} /> Bundle ({products.length} items)
            </h3>
            {products.map((product) => (
              <div key={product._id} className="flex items-center gap-3 border border-gray-200 rounded-lg p-3">
                <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                  <Image src={product.images?.[0]?.url || '/images/placeholder.jpg'} alt={product.title} fill sizes="48px" className="object-cover object-top" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-gray-900 truncate">{product.title}</p>
                  <p className="text-[9px] text-gray-400 uppercase mt-0.5">{product.category}</p>
                  <p className="text-xs font-bold text-gray-900 mt-1">
                    ৳{(product.offerPrice || product.basePrice).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <div className="pt-3 border-t border-gray-100">
            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1">
              <Star size={12} className="text-amber-400 fill-amber-400" /> Social Proof
            </p>
            <div className="space-y-2">
              {testimonials.slice(0, 2).map((t, idx) => (
                <div key={idx} className="bg-white border border-gray-100 rounded-lg p-3">
                  <div className="flex items-center gap-1 mb-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={10} className={i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-500 italic line-clamp-2">&ldquo;{t.comment}&rdquo;</p>
                  <p className="text-[9px] font-bold text-gray-800 mt-1.5">— {t.name}</p>
                </div>
              ))}
              {testimonials.length > 2 && (
                <p className="text-[9px] text-gray-400 text-center">+{testimonials.length - 2} more reviews</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-bold text-gray-900 uppercase tracking-wider truncate">
              {isSingle ? 'Limited Offer' : `${products.length} Items in Bundle`}
            </p>
          </div>
          <button className="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-[0.12em] flex items-center gap-1.5 shadow-sm shrink-0">
            <Package size={12} /> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──
export default function LandingPagePreviewModal({ page, pageId, onClose }: LandingPagePreviewModalProps) {
  const [pageData, setPageData] = useState<PageData | null>(page || null);
  const [loading, setLoading] = useState(!page && !!pageId);
  const [error, setError] = useState('');
  const [deviceView, setDeviceView] = useState<DeviceView>('mobile');

  const fetchPage = useCallback(async () => {
    if (!pageId || page) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/landing-pages/${pageId}`);
      const data = await res.json();
      if (data.success) {
        setPageData(data.page);
      } else {
        setError(data.error || 'Failed to load landing page data');
      }
    } catch (err) {
      setError('Network error loading page data');
    } finally {
      setLoading(false);
    }
  }, [pageId, page]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  const previewUrl = pageData ? `/lp/${pageData.slug}` : null;
  const DeviceIcon = deviceView ? DEVICE_ICONS[deviceView] : Monitor;
  const deviceLabel = DEVICE_LABELS[deviceView];
  const deviceWidth = DEVICE_WIDTHS[deviceView];

  // ── Loading State ──
  if (loading) {
    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl p-12 flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-slate-400" size={32} />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading preview...</p>
        </div>
      </div>
    );
  }

  // ── Error State ──
  if (error || !pageData) {
    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-8 flex flex-col items-center gap-4 text-center">
          <AlertCircle size={40} className="text-red-400" />
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Preview Unavailable</h3>
          <p className="text-xs text-slate-500">{error || 'Could not load landing page data.'}</p>
          <button
            onClick={onClose}
            className="mt-2 px-5 py-2.5 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-slate-800 active:scale-[0.97] transition-all"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[300] flex flex-col p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in overflow-hidden">
      {/* ── Toolbar ── */}
      <div className="shrink-0 bg-white rounded-t-xl sm:rounded-xl px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3 min-w-0">
          <h2 className="text-xs sm:text-sm font-black text-slate-900 truncate">
            Preview: {pageData.pageTitle}
          </h2>
          {!pageData.isActive && (
            <span className="text-[9px] font-bold uppercase text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              Draft
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Device toggle */}
          <div className="hidden sm:flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
            {(['mobile', 'tablet', 'desktop'] as DeviceView[]).map((view) => {
              const Icon = DEVICE_ICONS[view];
              return (
                <button
                  key={view}
                  onClick={() => setDeviceView(view)}
                  className={`p-2 rounded-md transition-all ${
                    deviceView === view
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-400 hover:text-slate-600 active:bg-slate-200 active:scale-[0.95]'
                  }`}
                  title={`${DEVICE_LABELS[view]} view`}
                >
                  <Icon size={16} />
                </button>
              );
            })}
          </div>

          {/* Mobile device selector (simplified dropdown) */}
          <select
            value={deviceView}
            onChange={(e) => setDeviceView(e.target.value as DeviceView)}
            className="sm:hidden text-[10px] font-bold uppercase border border-slate-200 rounded-lg px-2 py-1.5 bg-white outline-none"
          >
            <option value="mobile">📱 Mobile</option>
            <option value="tablet">📟 Tablet</option>
            <option value="desktop">💻 Desktop</option>
          </select>

          {/* View live link */}
          {previewUrl && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-800 active:text-blue-900 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 rounded-lg transition-colors"
            >
              <ExternalLink size={14} /> Open Live
            </a>
          )}

          <div className="w-px h-6 bg-slate-200 hidden sm:block" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:bg-slate-200 rounded-lg transition-all"
            title="Close preview"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── Preview Frame ── */}
      <div className="flex-1 min-h-0 flex items-start justify-center overflow-y-auto mt-2 sm:mt-3 pb-4">
        <div
          className={`w-full ${deviceWidth} bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 transition-all duration-300 flex flex-col`}
          style={{ minHeight: '60vh', maxHeight: '100%' }}
        >
          {/* Device chrome indicator */}
          {deviceView !== 'desktop' && (
            <div className="shrink-0 bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <DeviceIcon size={12} /> {deviceLabel}
              </span>
              <span>{deviceView === 'mobile' ? '375px' : '768px'}</span>
            </div>
          )}

          {/* Scrollable preview content */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <MiniLandingPreview page={pageData} />
          </div>
        </div>
      </div>
    </div>
  );
}
