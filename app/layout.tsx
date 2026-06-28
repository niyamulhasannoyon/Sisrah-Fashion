import type { Metadata } from 'next';
import { Montserrat, Hind_Siliguri } from 'next/font/google';
import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '500', '600', '700'],
  display: 'swap'
});

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali'],
  variable: '--font-hind-siliguri',
  weight: ['400', '500', '600', '700'],
  display: 'swap'
});

import dbConnect from '@/lib/dbConnect';
import Settings from '@/models/Settings';
import { getDirectImageLink } from '@/lib/utils';

export async function generateMetadata(): Promise<Metadata> {
  let faviconUrl = '/favicon.png';
  try {
    await dbConnect();
    const settings = await Settings.findOne();
    if (settings?.favicon) {
      faviconUrl = getDirectImageLink(settings.favicon);
    }
  } catch (error) {
    console.error('Error fetching settings favicon:', error);
  }

  return {
    title: 'AS SIDRAT — Premium Climate-Conscious Fashion in Bangladesh',
    description: 'Shop premium, minimalist clothing crafted for South Asian weather. Breathable linen shirts, organic cotton t-shirts, tailored trousers, and modern fusion wear with local cash on delivery.',
    keywords: ['AS SIDRAT', 'Fashion Bangladesh', 'Linen Shirts Dhaka', 'Premium Clothing Bangladesh', 'Minimalist Fashion', 'Fusion Wear Dhaka', 'AS SIDRAT Clothing'],
    authors: [{ name: 'AS SIDRAT' }],
    metadataBase: new URL('https://assidrat.com'),
    icons: {
      icon: faviconUrl,
      shortcut: faviconUrl,
      apple: faviconUrl,
    },
    openGraph: {
      title: 'AS SIDRAT — Premium Climate-Conscious Fashion in Bangladesh',
      description: 'Shop premium, minimalist clothing crafted for South Asian weather. Breathable linen shirts, organic cotton t-shirts, tailored trousers, and modern fusion wear.',
      url: 'https://assidrat.com',
      siteName: 'AS SIDRAT',
      images: [
        {
          url: '/images/hero-model.jpg',
          width: 1200,
          height: 630,
          alt: 'AS SIDRAT Premium Fashion',
        },
      ],
      locale: 'en_BD',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'AS SIDRAT — Premium Climate-Conscious Fashion in Bangladesh',
      description: 'Shop premium, minimalist clothing crafted for South Asian weather. Breathable linen shirts, organic cotton t-shirts, tailored trousers, and modern fusion wear.',
      images: ['/images/hero-model.jpg'],
    },
    robots: {
      index: true,
      follow: true,
    },
    verification: {
      google: '4mbgGQs3PoTcMTbCYLFypmE_u9bbwfwW4_F85kWGmXA',
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${hindSiliguri.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-loomra-white text-loomra-black antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
