'use client';

import { MessageCircle, ArrowRight } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useEffect } from 'react';

interface WhatsAppButtonProps {
  productName: string;
  productUrl: string;
  price: number;
  selectedSize?: string;
  selectedColor?: string;
  className?: string;
}

export default function WhatsAppButton({ 
  productName, 
  productUrl, 
  price,
  selectedSize,
  selectedColor,
  className = ''
}: WhatsAppButtonProps) {
  const { settings, fetchSettings } = useSettingsStore();

  useEffect(() => {
    if (!settings) {
      fetchSettings();
    }
  }, [settings, fetchSettings]);

  const rawPhone = settings?.whatsappNumber || "8801975745270";
  const brandPhone = rawPhone.replace(/\+/g, '').replace(/\s+/g, '');

  const handleWhatsAppOrder = () => {
    let details = `*Product:* ${productName}\n*Price:* ৳ ${price}`;
    if (selectedSize) {
      details += `\n*Size:* ${selectedSize}`;
    }
    if (selectedColor) {
      details += `\n*Color:* ${selectedColor}`;
    }
    details += `\n*Link:* ${productUrl}`;

    const message = `Hello AS SIDRAT! I want to order this item:\n\n${details}\n\nPlease let me know how to proceed.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${brandPhone}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
  };

  return (
    <button
      onClick={handleWhatsAppOrder}
      type="button"
      className={`w-full group relative flex items-center justify-center gap-3 bg-gradient-to-r from-[#25D366] via-[#20bd5a] to-[#128C7E] text-white py-3.5 px-5 sm:py-4 sm:px-6 rounded-xl font-bold uppercase tracking-[1.5px] text-xs sm:text-sm shadow-md shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-300 ${className}`}
    >
      {/* Icon with glowing ring container */}
      <span className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300 shrink-0">
        <MessageCircle size={18} className="text-white fill-white/20" />
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-300 rounded-full animate-ping opacity-75" />
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-200 rounded-full" />
      </span>

      <span className="flex flex-col items-start text-left">
        <span className="leading-none text-xs sm:text-sm font-black tracking-widest">Order via WhatsApp</span>
        <span className="text-[10px] text-emerald-100 font-medium normal-case tracking-normal mt-1 opacity-90">Instant chat & fast checkout</span>
      </span>

      <ArrowRight size={18} className="ml-auto opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 hidden sm:block shrink-0" />
    </button>
  );
}
