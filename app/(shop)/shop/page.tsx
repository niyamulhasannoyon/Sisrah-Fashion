import type { Metadata } from 'next';
import { Suspense } from 'react';
import ShopClient from '@/components/product/ShopClient';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'https://assidrat.vercel.app').replace(/\/+$/, '');

export const metadata: Metadata = {
  title: 'Shop Premium T-Shirt & Shirt Collection - AS SIDRAT (Sidrat) BD',
  description: 'Explore the complete Sidrat (AS SIDRAT) clothing collection. Premium t-shirts, bd t-shirts, linen shirts, gents shirts, pants & modern clothes with Cash on Delivery in Bangladesh.',
  keywords: ['sidrat', 'Sidrat', 'as sidrat', 'AS SIDRAT', 'sidrat fashion', 'sidrat t shirt', 't shirt', 't-shirt', 'premium t shirt', 'bd t shirt', 'shirt', 'cloths', 'clothes', 'AS SIDRAT Clothing'],
  alternates: {
    canonical: `${BASE_URL}/shop`,
  },
  openGraph: {
    title: 'Shop Premium T-Shirt & Shirt Collection - AS SIDRAT (Sidrat) BD',
    description: 'Explore the complete Sidrat (AS SIDRAT) clothing collection. Premium t-shirts, bd t-shirts, linen shirts & minimalist clothes with Cash on Delivery.',
    url: `${BASE_URL}/shop`,
    type: 'website',
    siteName: 'AS SIDRAT | Sidrat Fashion BD',
    locale: 'en_BD',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop Premium T-Shirt & Shirt Collection - AS SIDRAT (Sidrat) BD',
    description: 'Explore the complete Sidrat (AS SIDRAT) clothing collection. Premium t-shirts, bd t-shirts, linen shirts & minimalist clothes with Cash on Delivery.',
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
