import type { Metadata } from 'next';
import { Suspense } from 'react';
import ShopClient from '@/components/product/ShopClient';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Shop Premium T-Shirt & Shirt Collection - AS SIDRAT BD',
  description: 'Explore the complete AS SIDRAT collection. Premium t-shirts, bd t-shirts, linen shirts, gents shirts, pants & modern clothes with Cash on Delivery in Bangladesh.',
  keywords: ['sidrat', 'as sidrat', 't shirt', 't-shirt', 'premium t shirt', 'bd t shirt', 'shirt', 'cloths', 'clothes', 'AS SIDRAT Clothing'],
  alternates: {
    canonical: '/shop',
  },
  openGraph: {
    title: 'Shop Premium T-Shirt & Shirt Collection - AS SIDRAT BD',
    description: 'Explore the complete AS SIDRAT collection. Premium t-shirts, bd t-shirts, linen shirts & minimalist clothes with Cash on Delivery.',
    url: '/shop',
    type: 'website',
    siteName: 'AS SIDRAT',
    locale: 'en_BD',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop Premium T-Shirt & Shirt Collection - AS SIDRAT BD',
    description: 'Explore the complete AS SIDRAT collection. Premium t-shirts, bd t-shirts, linen shirts & minimalist clothes with Cash on Delivery.',
  }
};

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="animate-spin text-[#A31F24]" size={36} />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-3">Loading Collection...</p>
        </div>
      }
    >
      <ShopClient />
    </Suspense>
  );
}
