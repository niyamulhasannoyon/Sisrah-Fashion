"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneCall, X, Sparkles, ShieldCheck, ChevronRight, MessageSquare } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { WhatsAppIcon, MessengerIcon, getWhatsAppUrl, getMessengerUrl } from './MessagingIcons';

interface LandingContactWidgetProps {
  productTitle?: string;
  price?: number;
  pageSlug?: string;
  whatsappNumber?: string;
  messengerUrl?: string;
  facebookUrl?: string;
}

export default function LandingContactWidget({
  productTitle,
  price,
  pageSlug,
  whatsappNumber: propWhatsappNumber,
  messengerUrl: propMessengerUrl,
  facebookUrl: propFacebookUrl,
}: LandingContactWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const { settings, fetchSettings } = useSettingsStore();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!settings) {
      fetchSettings();
    }
  }, [settings, fetchSettings]);

  // Handle scroll to subtly show after user begins reading
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setHasScrolled(true);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const activeWhatsappNumber = propWhatsappNumber || settings?.whatsappNumber || '8801975745270';
  const activeFacebookUrl = propFacebookUrl || settings?.facebookUrl || 'https://facebook.com/assidrat';
  const activeMessengerUrl = propMessengerUrl || (settings as any)?.messengerUrl || '';

  // Current page URL for prefilled messages
  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://assidrat.vercel.app/lp/${pageSlug || ''}`;

  // Custom prefilled messages
  const waMessage = productTitle
    ? `আসসালামু আলাইকুম AS SIDRAT! আমি আপনাদের ল্যান্ডিং পেজ থেকে "${productTitle}"${price ? ` (৳${price.toLocaleString()})` : ''} সম্পর্কে জানতে / সরাসরি অর্ডার করতে চাই।\n\nলিঙ্ক: ${currentUrl}`
    : `আসসালামু আলাইকুম AS SIDRAT! আমি ল্যান্ডিং পেজ থেকে আপনাদের পণ্য সম্পর্কে তথ্য জানতে চাই।\n\nলিঙ্ক: ${currentUrl}`;

  const messengerMessage = productTitle
    ? `আসসালামু আলাইকুম AS SIDRAT! আমি "${productTitle}" সম্পর্কে জানতে / অর্ডার করতে চাই।`
    : `আসসালামু আলাইকুম AS SIDRAT! আমি আপনাদের সাথে কথা বলতে চাই।`;

  const waLink = getWhatsAppUrl(activeWhatsappNumber, waMessage);
  const messengerLink = getMessengerUrl(activeMessengerUrl, activeFacebookUrl, messengerMessage);
  const cleanPhoneForCall = activeWhatsappNumber.replace(/[^0-9]/g, '');

  return (
    <div
      ref={popoverRef}
      className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end font-sans select-none"
    >
      {/* ── Popover Modal ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="mb-3 w-[calc(100vw-2rem)] max-w-[340px] sm:w-[350px] bg-stone-950 text-white border border-stone-800 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Popover Header */}
            <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 p-4 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-md">
                  <MessageSquare size={20} className="text-white" />
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-stone-900 rounded-full animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-extrabold text-sm text-white tracking-tight">AS SIDRAT Support</h4>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase px-1.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-0.5">
                      <Sparkles size={9} /> Fast Reply
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5 flex items-center gap-1 font-bengali">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                    অনলাইনে আছেন • ১-২ মিনিটে উত্তর
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Popover Body */}
            <div className="p-4 space-y-2.5 bg-gradient-to-b from-stone-950 to-stone-900">
              <p className="text-[11px] text-stone-400 font-bengali px-1">
                যেকোনো তথ্যের জন্য অথবা সরাসরি চ্যাট করে অর্ডার করতে নিচের যেকোনো মাধ্যমে মেসেজ দিন:
              </p>

              {/* WhatsApp Action Card */}
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center gap-3.5 p-3.5 rounded-2xl bg-gradient-to-r from-[#25D366]/15 via-stone-900 to-stone-900 hover:from-[#25D366]/25 border border-[#25D366]/40 hover:border-[#25D366] transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-emerald-950/50 cursor-pointer"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center text-white shrink-0 shadow-md group-hover:scale-105 transition-transform">
                  <WhatsAppIcon className="w-6 h-6 fill-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h5 className="font-extrabold text-white text-xs tracking-wide">WhatsApp-এ মেসেজ দিন</h5>
                    <span className="bg-[#25D366]/20 text-[#25D366] text-[8px] font-black uppercase px-1.5 py-0.2 rounded font-sans">
                      Active
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-400 font-bengali mt-0.5 truncate group-hover:text-stone-300 transition-colors">
                    সরাসরি চ্যাট ও অর্ডার করতে ক্লিক করুন
                  </p>
                </div>
                <ChevronRight size={16} className="text-stone-500 group-hover:text-[#25D366] group-hover:translate-x-0.5 transition-all shrink-0" />
              </a>

              {/* Messenger Action Card */}
              <a
                href={messengerLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center gap-3.5 p-3.5 rounded-2xl bg-gradient-to-r from-[#0084FF]/15 via-stone-900 to-stone-900 hover:from-[#0084FF]/25 border border-[#0084FF]/40 hover:border-[#0084FF] transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-blue-950/50 cursor-pointer"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#00C6FF] via-[#0078FF] to-[#A800FF] flex items-center justify-center text-white shrink-0 shadow-md group-hover:scale-105 transition-transform">
                  <MessengerIcon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h5 className="font-extrabold text-white text-xs tracking-wide">Messenger-এ কথা বলুন</h5>
                    <span className="bg-[#0084FF]/20 text-[#00B2FF] text-[8px] font-black uppercase px-1.5 py-0.2 rounded font-sans">
                      Facebook
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-400 font-bengali mt-0.5 truncate group-hover:text-stone-300 transition-colors">
                    ফেসবুক মেসেঞ্জারে সরাসরি ইনবক্স করুন
                  </p>
                </div>
                <ChevronRight size={16} className="text-stone-500 group-hover:text-[#0084FF] group-hover:translate-x-0.5 transition-all shrink-0" />
              </a>

              {/* Direct Phone Call Button */}
              {cleanPhoneForCall && (
                <a
                  href={`tel:+${cleanPhoneForCall}`}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-300 hover:text-white transition-all text-xs cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-stone-800 flex items-center justify-center text-stone-300 group-hover:text-emerald-400">
                      <PhoneCall size={13} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold">সরাসরি কল করতে চান?</span>
                      <span className="text-[10px] text-stone-500 font-mono">+{cleanPhoneForCall}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                    Call Now
                  </span>
                </a>
              )}
            </div>

            {/* Footer Trust Guarantee */}
            <div className="p-3 bg-stone-950 border-t border-stone-900 flex items-center justify-center gap-1.5 text-[10px] text-stone-400 font-bengali">
              <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
              <span>১০০% অথেন্টিক প্রোডাক্ট ও সারা বাংলাদেশে হোম ডেলিভারি</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Trigger Button (Dual Brand Design) ── */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="group relative flex items-center gap-2.5 bg-stone-950/95 hover:bg-stone-900 text-white pl-3.5 pr-4 py-2.5 rounded-full shadow-2xl border-2 border-emerald-500/50 hover:border-emerald-400 transition-all duration-300 cursor-pointer backdrop-blur-md"
        aria-label="Open WhatsApp & Messenger Support"
      >
        {/* Overlapping Icons Avatar */}
        <div className="flex items-center -space-x-2 shrink-0">
          <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center shadow-md ring-2 ring-stone-950">
            <WhatsAppIcon className="w-4.5 h-4.5 fill-white" />
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00C6FF] via-[#0078FF] to-[#A800FF] flex items-center justify-center shadow-md ring-2 ring-stone-950">
            <MessengerIcon className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* Label & Status */}
        <div className="flex flex-col items-start text-left">
          <span className="text-[11px] font-black tracking-wide flex items-center gap-1.5 text-white">
            <span>মেসেজ দিন</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          </span>
          <span className="text-[9px] text-stone-400 font-medium font-bengali leading-none mt-0.5">
            WhatsApp বা Messenger
          </span>
        </div>
      </motion.button>
    </div>
  );
}
