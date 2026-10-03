'use client';

import dynamic from 'next/dynamic';

const CartDrawer = dynamic(() => import('@/components/cart/CartDrawer'), { ssr: false });
const FloatingWhatsAppWidget = dynamic(() => import('@/components/ui/FloatingWhatsAppWidget'), { ssr: false });

export default function ShopClientWidgets() {
  return (
    <>
      <CartDrawer />
      <FloatingWhatsAppWidget />
    </>
  );
}
