import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import CartDrawer from '@/components/cart/CartDrawer';
import { AnalyticsTracker } from '@/components/layout/AnalyticsTracker';
import LiveSalesProof from '@/components/ui/LiveSalesProof';
import FloatingWhatsAppWidget from '@/components/ui/FloatingWhatsAppWidget';
import { Suspense } from 'react';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
      <Navbar />
      <main className="flex-1 pb-28 md:pb-0">{children}</main>
      <Footer />
      <BottomNav />
      <CartDrawer />
      <LiveSalesProof />
      <FloatingWhatsAppWidget />
    </div>
  );
}

