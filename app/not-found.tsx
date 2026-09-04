import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import CartDrawer from '@/components/cart/CartDrawer';
import NotFoundSearch from '@/components/ui/NotFoundSearch';
import {
  Home,
  ShoppingBag,
  PackageSearch,
  MessageCircle,
  Sparkles,
  ArrowRight,
  Compass,
} from 'lucide-react';

export const metadata = {
  title: '404 - Page Not Found | AS SIDRAT',
  description: 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.',
  robots: {
    index: false,
    follow: true,
  },
};

const POPULAR_CATEGORIES = [
  { name: 'Men', href: '/category/men' },
  { name: 'Women', href: '/category/women' },
  { name: 'Fusion', href: '/category/fusion' },
  { name: 'Accessories', href: '/category/accessories' },
  { name: 'All Products', href: '/shop' },
];

export default function NotFound() {
  const whatsappNumber = '8801975745270';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    'Hello AS SIDRAT, I am looking for a product on your website but could not find the page. Can you please assist me?'
  )}`;

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#FAFAFA]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 md:py-24 px-4 pb-28 md:pb-24">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#A31F24] text-xs font-semibold tracking-wider uppercase animate-fade-in">
            <Sparkles size={13} className="text-[#A31F24]" />
            <span>404 • Page Not Found</span>
          </div>

          {/* Large Hero 404 Headline */}
          <div className="space-y-3">
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-[#1A1A1A] select-none">
              4<span className="text-[#A31F24]">0</span>4
            </h1>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight font-sans">
              Looking for Something Special?
            </h2>
            <p className="text-gray-600 text-sm md:text-base max-w-lg mx-auto font-sans leading-relaxed">
              The page you are looking for might have moved, been renamed, or is temporarily unavailable.
            </p>
            <p className="text-gray-500 text-xs md:text-sm font-bengali">
              আপনি যে পৃষ্ঠা বা পণ্যটি খুঁজছেন তা সরানো হয়েছে অথবা লিংকটি সঠিক নয়।
            </p>
          </div>

          {/* Interactive Search Bar */}
          <div className="pt-2">
            <NotFoundSearch />
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#1A1A1A] hover:bg-black text-white text-xs font-bold tracking-wide uppercase shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <Home size={15} />
              <span>Back to Home</span>
            </Link>

            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#A31F24] hover:bg-[#8B1A1E] text-white text-xs font-bold tracking-wide uppercase shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <ShoppingBag size={15} />
              <span>Browse Shop</span>
            </Link>

            <Link
              href="/track-order"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 text-xs font-bold tracking-wide uppercase shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <PackageSearch size={15} />
              <span>Track Order</span>
            </Link>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold tracking-wide uppercase shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <MessageCircle size={15} />
              <span>WhatsApp Support</span>
            </a>
          </div>

          {/* Popular Categories Shortcut Chips */}
          <div className="pt-6 border-t border-gray-200/80">
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              <Compass size={14} className="text-[#A31F24]" />
              <span>Popular Collections / জনপ্রিয় বিভাগ</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {POPULAR_CATEGORIES.map((cat) => (
                <Link
                  key={cat.href}
                  href={cat.href}
                  className="px-4 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-red-50 hover:text-[#A31F24] border border-gray-200 hover:border-red-200 rounded-full transition-all shadow-2xs"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
      <CartDrawer />
    </div>
  );
}
