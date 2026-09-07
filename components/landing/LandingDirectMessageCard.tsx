"use client";

import React from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { WhatsAppIcon, MessengerIcon, getWhatsAppUrl, getMessengerUrl } from './MessagingIcons';
import { MessageCircle, ShieldCheck, Sparkles } from 'lucide-react';

interface LandingDirectMessageCardProps {
  productTitle?: string;
  price?: number;
  selectedSize?: string;
  selectedColor?: string;
  pageSlug?: string;
}

export default function LandingDirectMessageCard({
  productTitle = 'AS SIDRAT Collection',
  price,
  selectedSize,
  selectedColor,
  pageSlug,
}: LandingDirectMessageCardProps) {
  const { settings } = useSettingsStore();

  const activeWhatsappNumber = settings?.whatsappNumber || '8801975745270';
  const activeFacebookUrl = settings?.facebookUrl || 'https://facebook.com/assidrat';
  const activeMessengerUrl = (settings as any)?.messengerUrl || '';

  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://assidrat.vercel.app/lp/${pageSlug || ''}`;

  let details = `*পণ্য:* ${productTitle}`;
  if (price) details += `\n*মূল্য:* ৳ ${price.toLocaleString()}`;
  if (selectedSize) details += `\n*সাইজ:* ${selectedSize}`;
  if (selectedColor) details += `\n*কালার:* ${selectedColor}`;
  details += `\n*লিঙ্ক:* ${currentUrl}`;

  const waMessage = `আসসালামু আলাইকুম AS SIDRAT! আমি ল্যান্ডিং পেজ থেকে সরাসরি অর্ডার করতে / বিস্তারিত জানতে চাই:\n\n${details}\n\nদয়া করে অর্ডারটি কনফার্ম করার প্রসেস জানিয়ে দিন।`;
  const messengerMessage = `আসসালামু আলাইকুম AS SIDRAT! আমি "${productTitle}"${price ? ` (৳${price.toLocaleString()})` : ''} সরাসরি অর্ডার করতে চাই।`;

  const waLink = getWhatsAppUrl(activeWhatsappNumber, waMessage);
  const messengerLink = getMessengerUrl(activeMessengerUrl, activeFacebookUrl, messengerMessage);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-stone-900 to-slate-950 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl space-y-5 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 text-center space-y-1.5">
        <span className="inline-flex items-center gap-1.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
          <Sparkles size={11} /> Instant Chat & Order
        </span>
        <h4 className="text-base sm:text-lg font-black text-white uppercase tracking-wide font-bengali">
          ফর্ম পূরণ না করে সরাসরি মেসেজে অর্ডার করতে চান?
        </h4>
        <p className="text-xs text-stone-400 font-bengali max-w-lg mx-auto leading-relaxed">
          যেকোনো তথ্যের জন্য অথবা সরাসরি চ্যাট করে অর্ডার করতে নিচের বাটনে ক্লিক করুন। আমাদের কাস্টমার কেয়ার প্রতিনিধি সাথে সাথে আপনার অর্ডার নিশ্চিত করবেন।
        </p>
      </div>

      {/* Dual CTA Buttons */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* WhatsApp Button */}
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center gap-3 bg-gradient-to-r from-[#25D366] via-[#20bd5a] to-[#128C7E] text-white p-4 rounded-2xl font-bold transition-all duration-300 shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] cursor-pointer"
        >
          <span className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform shrink-0">
            <WhatsAppIcon className="w-5 h-5 fill-white" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-300 rounded-full animate-ping opacity-75" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-200 rounded-full" />
          </span>

          <div className="flex flex-col items-start text-left min-w-0">
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider leading-none text-white">
              WhatsApp-এ অর্ডার করুন
            </span>
            <span className="text-[10px] text-emerald-100 font-medium font-bengali leading-none mt-1 opacity-90">
              ১ ক্লিকে সরাসরি চ্যাট শুরু করুন
            </span>
          </div>
        </a>

        {/* Messenger Button */}
        <a
          href={messengerLink}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center gap-3 bg-gradient-to-r from-[#00C6FF] via-[#0078FF] to-[#0055FF] text-white p-4 rounded-2xl font-bold transition-all duration-300 shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] cursor-pointer"
        >
          <span className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform shrink-0">
            <MessengerIcon className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-sky-300 rounded-full animate-ping opacity-75" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-sky-200 rounded-full" />
          </span>

          <div className="flex flex-col items-start text-left min-w-0">
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider leading-none text-white">
              Messenger-এ মেসেজ দিন
            </span>
            <span className="text-[10px] text-sky-100 font-medium font-bengali leading-none mt-1 opacity-90">
              ফেসবুক ইনবক্সে সরাসরি কথা বলুন
            </span>
          </div>
        </a>
      </div>

      {/* Trust Guarantee */}
      <div className="relative z-10 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-4 text-[11px] text-stone-400 font-bengali">
        <span className="flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
          ক্যাশ অন ডেলিভারি (হাতে পেয়ে মূল্য দিন)
        </span>
        <span className="text-stone-600 hidden sm:inline">•</span>
        <span className="flex items-center gap-1.5">
          <MessageCircle size={14} className="text-sky-400 shrink-0" />
          ৭ দিনের সহজ রিটার্ন বা এক্সচেঞ্জ
        </span>
      </div>
    </div>
  );
}
