"use client";

import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Mail, 
  MapPin, 
  Phone, 
  ChevronDown, 
  Truck, 
  ShieldCheck, 
  RefreshCw, 
  MessageCircle, 
  Send, 
  CheckCircle2,
  ExternalLink,
  Lock
} from 'lucide-react';
import { getDirectImageLink } from '@/lib/utils';

export function Footer() {
  const { settings } = useSettingsStore();
  const [mounted, setMounted] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  
  // Newsletter state
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleAccordion = (key: string) => {
    setOpenAccordion(prev => (prev === key ? null : key));
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }, 800);
  };

  const cleanWhatsappNumber = settings?.whatsappNumber 
    ? settings.whatsappNumber.replace(/\+/g, '').replace(/\s+/g, '').replace(/-/g, '')
    : '8801975745270';

  const formattedWhatsapp = settings?.whatsappNumber || '+8801975745270';

  return (
    <footer className="relative border-t border-zinc-800/80 bg-[#0A0A0C] text-[#E4E4E7] pt-0 pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-12 overflow-hidden select-none-text">
      
      {/* ── 1. VALUE PROPOSITIONS BAR ── */}
      <div className="border-b border-zinc-800/60 bg-[#0F0F12]/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            
            <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/50 hover:border-zinc-700/80 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-[#A31F24]/15 text-[#A31F24] flex items-center justify-center shrink-0">
                <Truck size={20} />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white uppercase tracking-wider">Fast Delivery</h5>
                <p className="text-[11px] text-zinc-400">Nationwide across Bangladesh</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/50 hover:border-zinc-700/80 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-[#A31F24]/15 text-[#A31F24] flex items-center justify-center shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white uppercase tracking-wider">100% Authentic</h5>
                <p className="text-[11px] text-zinc-400">Premium South Asian fabrics</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/50 hover:border-zinc-700/80 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-[#A31F24]/15 text-[#A31F24] flex items-center justify-center shrink-0">
                <RefreshCw size={20} />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white uppercase tracking-wider">Easy Exchange</h5>
                <p className="text-[11px] text-zinc-400">Hassle-free size replacement</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/50 hover:border-zinc-700/80 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-[#25D366]/15 text-[#25D366] flex items-center justify-center shrink-0">
                <MessageCircle size={20} />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white uppercase tracking-wider">WhatsApp Support</h5>
                <p className="text-[11px] text-zinc-400">Instant customer help</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── 2. MAIN CONTENT GRID ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* BRAND COLUMN (Lg: 4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            {/* Logo Card Container */}
            <Link href="/" className="inline-block self-start group">
              {!mounted ? (
                <div className="h-14 w-44 bg-zinc-900 animate-pulse rounded-xl" />
              ) : settings?.logo ? (
                <div className="p-3 bg-white rounded-xl border border-white/20 shadow-md shadow-black/40 transition-transform duration-300 group-hover:scale-[1.02] inline-block">
                  <div className="relative h-12 w-40">
                    <Image 
                      src={getDirectImageLink(settings.logo)} 
                      alt="AS SIDRAT" 
                      fill 
                      sizes="160px"
                      className="object-contain object-left" 
                      priority={false}
                    />
                  </div>
                </div>
              ) : (
                <span className="text-2xl font-black tracking-tight text-white uppercase font-sans">
                  AS SIDRAT
                </span>
              )}
            </Link>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              Crafted for modern elegance while preserving rich South Asian heritage. Minimalist silhouettes, breathable luxury fabrics, and timeless design for your wardrobe.
            </p>

            {/* Direct WhatsApp Pill Badge */}
            <div className="mt-1">
              <a
                href={`https://wa.me/${cleanWhatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] text-xs font-bold transition-all duration-300 group shadow-sm"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#25D366]"></span>
                </span>
                <span>Order via WhatsApp: <strong className="font-extrabold text-white">{formattedWhatsapp}</strong></span>
                <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>

            {/* Social Media Icons */}
            <div className="flex items-center gap-3 mt-1">
              <a 
                href={settings?.facebookUrl || "https://facebook.com"} 
                aria-label="Facebook" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#1877F2] hover:border-[#1877F2] transition-all duration-300 shadow-sm"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                </svg>
              </a>
              <a 
                href={settings?.instagramUrl || "https://instagram.com"} 
                aria-label="Instagram" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:border-transparent transition-all duration-300 shadow-sm"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.01 3.71.054.937.04 1.612.189 2.185.411a4.896 4.896 0 011.626 1.057 4.896 4.896 0 011.057 1.625c.222.573.371 1.248.411 2.185.044.926.054 1.281.054 3.71s-.01 2.784-.054 3.71c-.04.937-.189 1.612-.411 2.185a4.896 4.896 0 01-1.057 1.626 4.896 4.896 0 01-1.625 1.057c-.573.222-1.248.371-2.185.411-.926.044-1.281.054-3.71.054s-2.784-.01-3.71-.054c-.937-.04-1.612-.189-2.185-.411a4.896 4.896 0 01-1.626-1.057 4.896 4.896 0 01-1.057-1.625c-.222-.573-.371-1.248-.411-2.185C2.01 16.1 2 15.745 2 13.315s.01-2.784.054-3.71c.04-.937.189-1.612.411-2.185a4.896 4.896 0 011.057-1.626 4.896 4.896 0 011.625-1.057c.573-.222 1.248-.371 2.185-.411.926-.044 1.281-.054 3.71-.054zM12 5.802a7.513 7.513 0 100 15.026 7.513 7.513 0 000-15.026zm0 1.802a5.711 5.711 0 110 11.422 5.711 5.711 0 010-11.422zm4.74-2.484a1.34 1.34 0 110 2.68 1.34 1.34 0 010-2.68z" clipRule="evenodd" />
                </svg>
              </a>
              {settings?.youtubeUrl && (
                <a 
                  href={settings.youtubeUrl} 
                  aria-label="YouTube" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#FF0000] hover:border-[#FF0000] transition-all duration-300 shadow-sm"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* QUICK SHOP ACCORDION / COLUMN (Lg: 2 Cols) */}
          <div className="lg:col-span-2 border-b border-zinc-800/80 md:border-none pb-4 md:pb-0">
            <button 
              onClick={() => toggleAccordion('quickShop')}
              className="w-full flex items-center justify-between py-2 md:py-0 md:cursor-default text-left"
            >
              <h4 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A31F24]"></span>
                Quick Shop
              </h4>
              <ChevronDown 
                size={18} 
                className={`text-zinc-400 md:hidden transition-transform duration-300 ${openAccordion === 'quickShop' ? 'rotate-180 text-white' : ''}`} 
              />
            </button>

            <div className={`mt-3 md:mt-4 flex-col gap-2.5 text-xs text-zinc-400 ${openAccordion === 'quickShop' ? 'flex' : 'hidden md:flex'}`}>
              <Link href="/category/men" className="hover:text-white hover:translate-x-1 transition-all duration-200 py-1 inline-block">
                Men's Collection
              </Link>
              <Link href="/category/women" className="hover:text-white hover:translate-x-1 transition-all duration-200 py-1 inline-block">
                Women's Collection
              </Link>
              <Link href="/category/fusion" className="hover:text-white hover:translate-x-1 transition-all duration-200 py-1 inline-block">
                Fusion Wear
              </Link>
              <Link href="/shop" className="hover:text-white hover:translate-x-1 transition-all duration-200 py-1 inline-block">
                All New Arrivals
              </Link>
              <Link href="/community" className="hover:text-white hover:translate-x-1 transition-all duration-200 py-1 inline-block">
                Community Gallery
              </Link>
            </div>
          </div>

          {/* CUSTOMER CARE ACCORDION / COLUMN (Lg: 2 Cols) */}
          <div className="lg:col-span-2 border-b border-zinc-800/80 md:border-none pb-4 md:pb-0">
            <button 
              onClick={() => toggleAccordion('customerCare')}
              className="w-full flex items-center justify-between py-2 md:py-0 md:cursor-default text-left"
            >
              <h4 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A31F24]"></span>
                Customer Care
              </h4>
              <ChevronDown 
                size={18} 
                className={`text-zinc-400 md:hidden transition-transform duration-300 ${openAccordion === 'customerCare' ? 'rotate-180 text-white' : ''}`} 
              />
            </button>

            <div className={`mt-3 md:mt-4 flex-col gap-2.5 text-xs text-zinc-400 ${openAccordion === 'customerCare' ? 'flex' : 'hidden md:flex'}`}>
              <Link href="/track-order" className="hover:text-white hover:translate-x-1 transition-all duration-200 py-1 inline-block">
                Track Your Order
              </Link>
              <Link href="/shipping-returns" className="hover:text-white hover:translate-x-1 transition-all duration-200 py-1 inline-block">
                Shipping & Returns
              </Link>
              <Link href="/faq" className="hover:text-white hover:translate-x-1 transition-all duration-200 py-1 inline-block">
                FAQ & Support
              </Link>
              <Link href="/size-guide" className="hover:text-white hover:translate-x-1 transition-all duration-200 py-1 inline-block">
                Size Guide
              </Link>
              <Link href="/privacy-policy" className="hover:text-white hover:translate-x-1 transition-all duration-200 py-1 inline-block">
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* CONTACT INFO COLUMN (Lg: 4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A31F24]"></span>
              Get In Touch
            </h4>

            <ul className="flex flex-col gap-3.5 text-xs text-zinc-300">
              <li className="flex gap-3 items-start p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/40">
                <MapPin size={16} className="text-[#A31F24] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {settings?.contactAddress || "Mirpur 1, Dhaka-1216, Bangladesh"}
                </span>
              </li>

              <li className="flex gap-3 items-center p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/40">
                <Mail size={16} className="text-[#A31F24] shrink-0" />
                <a 
                  href={`mailto:${settings?.contactEmail || "assidrat12@gmail.com"}`} 
                  className="hover:text-white hover:underline transition-colors truncate"
                >
                  {settings?.contactEmail || "assidrat12@gmail.com"}
                </a>
              </li>

              <li className="flex gap-3 items-center p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/40">
                <Phone size={16} className="text-[#A31F24] shrink-0" />
                <a 
                  href={`https://wa.me/${cleanWhatsappNumber}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors font-semibold"
                >
                  WhatsApp Support: {formattedWhatsapp}
                </a>
              </li>
            </ul>

            {/* Newsletter VIP Box */}
            <div className="mt-2 p-4 rounded-2xl bg-gradient-to-br from-zinc-900 via-[#121215] to-zinc-900 border border-zinc-800/80 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-extrabold text-white uppercase tracking-wider mb-1">
                <Lock size={14} className="text-[#A31F24]" />
                <span>Join The VIP Club</span>
              </div>
              <p className="text-[11px] text-zinc-400 mb-3">
                Subscribe for exclusive drop notifications, secret offers & seasonal discounts.
              </p>

              {subscribed ? (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] text-xs font-bold animate-fadeIn">
                  <CheckCircle2 size={16} />
                  <span>Thank you! You are now subscribed.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#A31F24] transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-[#A31F24] hover:bg-[#85181C] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 shrink-0 shadow-md active:scale-95 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <span>Join</span>
                        <Send size={12} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>

        {/* ── 3. SEPARATOR ── */}
        <div className="my-10 border-t border-zinc-800/80" />

        {/* ── 4. FOOTER BOTTOM BAR & PAYMENT BADGES ── */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-[11px] text-zinc-400">
          
          {/* Copyright & Brand Motto */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <p>© {new Date().getFullYear()} <strong className="text-zinc-200">AS SIDRAT</strong>. All Rights Reserved.</p>
            <span className="hidden sm:inline text-zinc-700">•</span>
            <p className="text-zinc-500">Crafted for comfort, rooted in tradition.</p>
          </div>

          {/* Payment Badges Container */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-[10px] uppercase font-bold text-zinc-500 mr-1">Accepted Payments:</span>
            
            <span className="px-2.5 py-1 rounded-md bg-[#E2136E]/15 border border-[#E2136E]/30 text-[#E2136E] text-[10px] font-black tracking-wide">
              bKash
            </span>
            
            <span className="px-2.5 py-1 rounded-md bg-[#F7921E]/15 border border-[#F7921E]/30 text-[#F7921E] text-[10px] font-black tracking-wide">
              Nagad
            </span>

            <span className="px-2.5 py-1 rounded-md bg-white/10 border border-white/20 text-zinc-200 text-[10px] font-bold">
              Cards / SSLCommerz
            </span>

            <span className="px-2.5 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-bold">
              Cash On Delivery
            </span>
          </div>

          {/* Legal Links */}
          <div className="flex items-center gap-4 text-zinc-400">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms-of-service" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>

        </div>

      </div>
    </footer>
  );
}
