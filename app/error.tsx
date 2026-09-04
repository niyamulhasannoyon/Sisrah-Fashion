'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import CartDrawer from '@/components/cart/CartDrawer';
import {
  AlertTriangle,
  RefreshCw,
  Home,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
} from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Log structured error for observability
    console.error('Unhandled App Runtime Error caught by error boundary:', {
      message: error?.message,
      digest: error?.digest,
      stack: error?.stack,
    });
  }, [error]);

  const whatsappNumber = '8801975745270';
  const errorRef = error.digest ? ` [Ref: ${error.digest}]` : '';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hello AS SIDRAT Support, I encountered an issue on your website${errorRef}. Could you please assist me?`
  )}`;

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#FAFAFA]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 md:py-24 px-4 pb-28 md:pb-24">
        <div className="max-w-xl w-full text-center space-y-6">
          {/* Eyebrow Error Indicator */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-[#A31F24] mb-2 shadow-sm animate-pulse">
            <AlertTriangle size={32} />
          </div>

          {/* Headline & Explanatory Copy */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-[#A31F24] text-[11px] font-bold tracking-wider uppercase">
              <span>System Notice • Error Occurred</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-[#1A1A1A] tracking-tight font-sans">
              Oops! Something Went Wrong
            </h1>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-md mx-auto font-sans">
              We encountered an unexpected glitch while loading this page. Your shopping bag and saved preferences remain safe.
            </p>
            <p className="text-gray-500 text-xs md:text-sm font-bengali">
              পৃষ্ঠাটি লোড করার সময় একটি সাময়িক ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন অথবা হোমপেজে ফিরে যান।
            </p>
          </div>

          {/* Action Recovery Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#A31F24] hover:bg-[#8B1A1E] text-white text-xs font-bold tracking-wide uppercase shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <RefreshCw size={15} />
              <span>Try Again / আবার চেষ্টা করুন</span>
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1A1A1A] hover:bg-black text-white text-xs font-bold tracking-wide uppercase shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <Home size={15} />
              <span>Back to Home</span>
            </Link>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold tracking-wide uppercase shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <MessageCircle size={15} />
              <span>WhatsApp Support</span>
            </a>
          </div>

          {/* Expandable Technical Diagnostics */}
          <div className="pt-6 border-t border-gray-200 text-left">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between text-xs text-gray-500 hover:text-gray-800 font-medium py-1 transition-colors"
            >
              <span>Technical Diagnostics {error.digest ? `(ID: ${error.digest})` : ''}</span>
              {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showDetails && (
              <div className="mt-3 p-4 bg-gray-900 text-gray-200 rounded-xl text-xs font-mono overflow-x-auto space-y-2 max-h-56 shadow-inner">
                {error.digest && (
                  <p className="text-red-400 font-semibold">Error Digest: {error.digest}</p>
                )}
                <p className="break-all">{error.message || 'Unknown runtime error'}</p>
                {process.env.NODE_ENV === 'development' && error.stack && (
                  <pre className="text-[10px] text-gray-400 whitespace-pre-wrap mt-2 border-t border-gray-800 pt-2">
                    {error.stack}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
      <CartDrawer />
    </div>
  );
}
