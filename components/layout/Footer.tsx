"use client";

import { useSettingsStore } from '@/store/useSettingsStore';
import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';

export function Footer() {
  const { settings } = useSettingsStore();

  return (
    <footer className="border-t border-slate-100 bg-[#0F0F10] text-[#E4E4E7] pt-16 pb-32 pb-safe md:pb-12">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        {/* Core Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          
          {/* Brand Info */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="text-xl font-black tracking-tight text-white">
              {settings?.logo ? (
                <img src={settings.logo} alt="AS SIDRAT" className="h-10 md:h-12 w-auto object-contain brightness-0 invert" />
              ) : (
                "AS SIDRAT"
              )}
            </Link>
            <p className="text-xs text-[#A1A1AA] leading-relaxed max-w-xs">
              Premium South Asian fashion crafted for the modern lifestyle. Breathable fabrics, minimal silhouettes, and timeless heritage.
            </p>
            {/* Social Icons */}
            <div className="flex gap-4 mt-2">
              <a href={settings?.facebookUrl || "https://facebook.com"} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#27272A] hover:bg-loomra-red text-[#D4D4D8] hover:text-white rounded-full transition-colors duration-300">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                </svg>
              </a>
              <a href={settings?.instagramUrl || "https://instagram.com"} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#27272A] hover:bg-loomra-red text-[#D4D4D8] hover:text-white rounded-full transition-colors duration-300">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.01 3.71.054.937.04 1.612.189 2.185.411a4.896 4.896 0 011.626 1.057 4.896 4.896 0 011.057 1.625c.222.573.371 1.248.411 2.185.044.926.054 1.281.054 3.71s-.01 2.784-.054 3.71c-.04.937-.189 1.612-.411 2.185a4.896 4.896 0 01-1.057 1.626 4.896 4.896 0 01-1.625 1.057c-.573.222-1.248.371-2.185.411-.926.044-1.281.054-3.71.054s-2.784-.01-3.71-.054c-.937-.04-1.612-.189-2.185-.411a4.896 4.896 0 01-1.626-1.057 4.896 4.896 0 01-1.057-1.625c-.222-.573-.371-1.248-.411-2.185C2.01 16.1 2 15.745 2 13.315s.01-2.784.054-3.71c.04-.937.189-1.612.411-2.185a4.896 4.896 0 011.057-1.626 4.896 4.896 0 011.625-1.057c.573-.222 1.248-.371 2.185-.411.926-.044 1.281-.054 3.71-.054zM12 5.802a7.513 7.513 0 100 15.026 7.513 7.513 0 000-15.026zm0 1.802a5.711 5.711 0 110 11.422 5.711 5.711 0 010-11.422zm4.74-2.484a1.34 1.34 0 110 2.68 1.34 1.34 0 010-2.68z" clipRule="evenodd" />
                </svg>
              </a>
              {settings?.youtubeUrl && (
                <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#27272A] hover:bg-loomra-red text-[#D4D4D8] hover:text-white rounded-full transition-colors duration-300">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Quick Shop Links */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Quick Shop</h4>
            <ul className="flex flex-col gap-2.5 text-xs text-[#A1A1AA]">
              <li><Link href="/category/men" className="hover:text-white transition-colors">Men's Collection</Link></li>
              <li><Link href="/category/women" className="hover:text-white transition-colors">Women's Collection</Link></li>
              <li><Link href="/category/fusion" className="hover:text-white transition-colors">Fusion Wear</Link></li>
              <li><Link href="/products" className="hover:text-white transition-colors">All New Arrivals</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Customer Care</h4>
            <ul className="flex flex-col gap-2.5 text-xs text-[#A1A1AA]">
              <li><Link href="/track-order" className="hover:text-white transition-colors">Track Your Order</Link></li>
              <li><Link href="/track-order" className="hover:text-white transition-colors">Shipping & Returns</Link></li>
              <li><Link href="/track-order" className="hover:text-white transition-colors">FAQ & Support</Link></li>
              <li><Link href="/track-order" className="hover:text-white transition-colors">Size Guide</Link></li>
            </ul>
          </div>

          {/* Get In Touch */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Contact Info</h4>
            <ul className="flex flex-col gap-3.5 text-xs text-[#A1A1AA]">
              <li className="flex gap-2 items-start">
                <MapPin size={16} className="text-loomra-red shrink-0" />
                <span>{settings?.contactAddress || "Gulshan-2, Dhaka, Bangladesh"}</span>
              </li>
              <li className="flex gap-2 items-center">
                <Mail size={16} className="text-loomra-red shrink-0" />
                <span>{settings?.contactEmail || "support@assidrat.com"}</span>
              </li>
              {settings?.whatsappNumber ? (
                <li className="flex gap-2 items-center">
                  <Phone size={16} className="text-loomra-red shrink-0" />
                  <a 
                    href={`https://wa.me/${settings.whatsappNumber.replace(/\+/g, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-white hover:underline transition-colors font-semibold"
                  >
                    WhatsApp: {settings.whatsappNumber}
                  </a>
                </li>
              ) : (
                <li className="flex gap-2 items-center">
                  <Phone size={16} className="text-loomra-red shrink-0" />
                  <a 
                    href="https://wa.me/8801700000000" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-white hover:underline transition-colors font-semibold"
                  >
                    WhatsApp: +880 1700-000000
                  </a>
                </li>
              )}
            </ul>
          </div>

        </div>

        {/* Divider */}
        <hr className="border-[#27272A] mb-8" />

        {/* Footer Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 text-[11px] text-[#71717A]">
          <p>© {new Date().getFullYear()} AS SIDRAT. Crafted for comfort, rooted in tradition. All Rights Reserved.</p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span>Payments: <b>bKash, Nagad, Cards, SSLCommerz-ready</b></span>
            <div className="flex gap-3 text-gray-500">
              <Link href="/track-order" className="hover:text-white transition-colors">Privacy Policy</Link>
              <span>•</span>
              <Link href="/track-order" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
