import type { Metadata } from 'next';
import ShopClient from '@/components/product/ShopClient';

export const metadata: Metadata = {
  title: 'Shop Premium Minimalist Collection - AS SIDRAT',
  description: 'Explore the complete AS SIDRAT collection. Premium linen shirts, tailored pants, panjabis, and kaftans designed for tropical weather and modern aesthetics.',
  alternates: {
    canonical: 'https://assidrat.com/shop',
  },
  openGraph: {
    title: 'Shop Premium Minimalist Collection - AS SIDRAT',
    description: 'Explore the complete AS SIDRAT collection. Premium linen shirts, tailored pants, panjabis, and kaftans designed for tropical weather.',
    url: 'https://assidrat.com/shop',
    type: 'website',
    siteName: 'AS SIDRAT',
    locale: 'en_BD',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop Premium Minimalist Collection - AS SIDRAT',
    description: 'Explore the complete AS SIDRAT collection. Premium linen shirts, tailored pants, panjabis, and kaftans designed for tropical weather.',
  }
};

export default function ShopPage() {
  return <ShopClient />;
}
