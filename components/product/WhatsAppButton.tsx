'use client';

import { MessageCircle } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useEffect } from 'react';

interface WhatsAppButtonProps {
  productName: string;
  productUrl: string;
  price: number;
  selectedSize?: string;
  selectedColor?: string;
}

export default function WhatsAppButton({ 
  productName, 
  productUrl, 
  price,
  selectedSize,
  selectedColor 
}: WhatsAppButtonProps) {
  const { settings, fetchSettings } = useSettingsStore();

  useEffect(() => {
    if (!settings) {
      fetchSettings();
    }
  }, [settings, fetchSettings]);

  const rawPhone = settings?.whatsappNumber || "8801733919156";
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
      className="w-full mt-16px flex items-center justify-center gap-8px bg-[#25D366] text-white py-16px text-small font-bold uppercase tracking-widest hover:bg-[#1DA851] transition-colors rounded-[4px]"
    >
      <MessageCircle size={20} />
      Order via WhatsApp
    </button>
  );
}
