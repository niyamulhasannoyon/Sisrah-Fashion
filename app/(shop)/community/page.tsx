import type { Metadata } from 'next';
import CommunityClient from '@/components/ui/CommunityClient';

export const metadata: Metadata = {
  title: 'Style Lookbook & Inspirations - AS SIDRAT',
  description: 'Get style inspiration from our curated minimal fashion lookbook. Explore styling ideas for premium linen shirts, trousers, and fusion wear.',
  alternates: {
    canonical: 'https://assidrat.com/community',
  },
  openGraph: {
    title: 'Style Lookbook & Inspirations - AS SIDRAT',
    description: 'Get style inspiration from our curated minimal fashion lookbook. Explore styling ideas for premium linen shirts, trousers, and fusion wear.',
    url: 'https://assidrat.com/community',
    type: 'website',
    siteName: 'AS SIDRAT',
    locale: 'en_BD',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Style Lookbook & Inspirations - AS SIDRAT',
    description: 'Get style inspiration from our curated minimal fashion lookbook. Explore styling ideas for premium linen shirts, trousers, and fusion wear.',
  }
};

export default function CommunityPage() {
  return <CommunityClient />;
}
