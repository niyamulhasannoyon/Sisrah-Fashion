'use client';

import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  productName: string;
  productUrl: string;
  price: number;
}

export default function WhatsAppButton({ productName, productUrl, price }: WhatsAppButtonProps) {
  const brandPhone = "8801733919156"; // Replace with actual Loomra business number

  const handleWhatsAppOrder = () => {
    const message = `Hello Loomra! I want to order this item:\n\n*Product:* ${productName}\n*Price:* ৳ ${price}\n*Link:* ${productUrl}\n\nPlease let me know how to proceed.`;
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
