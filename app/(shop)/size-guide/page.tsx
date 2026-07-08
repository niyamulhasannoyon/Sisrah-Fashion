import type { Metadata } from 'next';
import SizeGuideClient from '@/components/ui/SizeGuideClient';

export const metadata: Metadata = {
  title: 'Size Guide & Fit Advisor - AS SIDRAT',
  description: 'Find your perfect fit. View size charts for AS SIDRAT shirts, panjabis, trousers, and co-ords to ensure comfortable, well-tailored wear.',
  alternates: {
    canonical: 'https://assidrat.com/size-guide',
  },
  openGraph: {
    title: 'Size Guide & Fit Advisor - AS SIDRAT',
    description: 'Find your perfect fit. View size charts for AS SIDRAT shirts, panjabis, trousers, and co-ords to ensure comfortable, well-tailored wear.',
    url: 'https://assidrat.com/size-guide',
    type: 'website',
    siteName: 'AS SIDRAT',
    locale: 'en_BD',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Size Guide & Fit Advisor - AS SIDRAT',
    description: 'Find your perfect fit. View size charts for AS SIDRAT shirts, panjabis, trousers, and co-ords to ensure comfortable, well-tailored wear.',
  }
};

export default function SizeGuidePage() {
  return <SizeGuideClient />;
}
