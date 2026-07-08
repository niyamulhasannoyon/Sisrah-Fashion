import type { Metadata } from 'next';
import TrackOrderClient from '@/components/ui/TrackOrderClient';

export const metadata: Metadata = {
  title: 'Track Your Order - AS SIDRAT',
  description: 'Track the real-time status of your AS SIDRAT order in Bangladesh. Simply enter your Order ID and Phone Number to check transit details.',
  alternates: {
    canonical: 'https://assidrat.com/track-order',
  },
  openGraph: {
    title: 'Track Your Order - AS SIDRAT',
    description: 'Track the real-time status of your AS SIDRAT order in Bangladesh. Simply enter your Order ID and Phone Number to check transit details.',
    url: 'https://assidrat.com/track-order',
    type: 'website',
    siteName: 'AS SIDRAT',
    locale: 'en_BD',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Track Your Order - AS SIDRAT',
    description: 'Track the real-time status of your AS SIDRAT order in Bangladesh. Simply enter your Order ID and Phone Number to check transit details.',
  }
};

export default function TrackOrderPage() {
  return <TrackOrderClient />;
}
