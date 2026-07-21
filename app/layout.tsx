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

const BASE_URL = 'https://assidrat.com';

export const metadata: Metadata = {
  title: 'AS SIDRAT | Premium Shirt & T-Shirt Brand Bangladesh',
  description: 'Shop premium, minimalist clothing crafted for South Asian weather. Breathable linen shirts, organic cotton t-shirts, tailored trousers, and modern fusion wear with local cash on delivery.',
  keywords: ['AS SIDRAT', 'Fashion Bangladesh', 'Linen Shirts Dhaka', 'Premium Clothing Bangladesh', 'Minimalist Fashion', 'Fusion Wear Dhaka', 'AS SIDRAT Clothing'],
  authors: [{ name: 'AS SIDRAT' }],
  metadataBase: new URL(BASE_URL),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.png', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon.png', type: 'image/png', sizes: '192x192' },
    ],
    shortcut: '/favicon.png',
    apple: [
      { url: '/favicon.png', sizes: '180x180' },
      { url: '/apple-icon.png', sizes: '180x180' },
    ],
  },
  openGraph: {
    title: 'AS SIDRAT | Premium Shirt & T-Shirt Brand Bangladesh',
    description: 'Shop premium, minimalist clothing crafted for South Asian weather. Breathable linen shirts, organic cotton t-shirts, tailored trousers, and modern fusion wear.',
    url: BASE_URL,
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
    title: 'AS SIDRAT | Premium Shirt & T-Shirt Brand Bangladesh',
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

import StoreInitializer from '@/components/layout/StoreInitializer';
import dbConnect from '@/lib/dbConnect';
import Settings from '@/models/Settings';

export const revalidate = 60;

async function getSettings() {
  try {
    await dbConnect();
    let settings = await Settings.findOne().lean();
    if (!settings) {
      // Prevent compiler tree-shaking and create empty document if not present
      const doc = new Settings({});
      await doc.save();
      settings = doc.toObject();
    }
    return JSON.parse(JSON.stringify(settings));
  } catch (error) {
    console.error('Error fetching settings in layout:', error);
    return null;
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <html lang="en" className={`${montserrat.variable} ${hindSiliguri.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://lh3.googleusercontent.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              'name': 'AS SIDRAT',
              'url': BASE_URL,
              'alternateName': ['AS SIDRAT Clothing', 'Sisrah Fashion'],
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-loomra-white text-loomra-black antialiased font-sans" suppressHydrationWarning>
        <StoreInitializer settings={settings} />
        {children}
      </body>
    </html>
  );
}
