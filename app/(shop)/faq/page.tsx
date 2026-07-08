import type { Metadata } from 'next';
import FaqClient from '@/components/ui/FaqClient';

export const metadata: Metadata = {
  title: 'FAQ & Customer Support - AS SIDRAT',
  description: 'Got questions about shipping, sizing, or returns? Find answers to frequently asked questions about shopping with AS SIDRAT in Bangladesh.',
  alternates: {
    canonical: 'https://assidrat.com/faq',
  },
  openGraph: {
    title: 'FAQ & Customer Support - AS SIDRAT',
    description: 'Got questions about shipping, sizing, or returns? Find answers to frequently asked questions about shopping with AS SIDRAT in Bangladesh.',
    url: 'https://assidrat.com/faq',
    type: 'website',
    siteName: 'AS SIDRAT',
    locale: 'en_BD',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQ & Customer Support - AS SIDRAT',
    description: 'Got questions about shipping, sizing, or returns? Find answers to frequently asked questions about shopping with AS SIDRAT in Bangladesh.',
  }
};

export default function FAQPage() {
  return <FaqClient />;
}
