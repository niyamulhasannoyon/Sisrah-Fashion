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

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://assidrat.vercel.app';

export const metadata: Metadata = {
  title: 'AS SIDRAT | Premium T-Shirt, Shirt & Clothing Brand Bangladesh',
  description: 'AS SIDRAT (Sidrat) is Bangladesh\'s leading online brand for premium t-shirts, linen shirts, bd t-shirts, and modern minimalist clothing. High quality fabrics, perfect fit, with cash on delivery across BD.',
  keywords: [
    'sidrat',
    'as sidrat',
    'sidrat fashion',
    'as sidrat clothing',
    't shirt',
    't-shirt',
    'premium t shirt',
    'bd t shirt',
    't shirt bd',
    'cloths',
    'clothes',
    'shirt',
    'premium shirt',
    'shirt bd',
    'linen shirt bd',
    'polo t shirt',
    't shirt price in bd',
    'mens clothing bd',
    'clothing brand bangladesh',
    'Fashion Bangladesh',
    'Sisrah Fashion'
  ],
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
    title: 'AS SIDRAT | Premium T-Shirt, Shirt & Clothing Brand Bangladesh',
    description: 'AS SIDRAT - Buy premium t-shirts, linen shirts, bd t-shirts, and modern clothes in Bangladesh with Cash on Delivery.',
    url: BASE_URL,
    siteName: 'AS SIDRAT',
    images: [
      {
        url: '/images/hero-model.jpg',
        width: 1200,
        height: 630,
        alt: 'AS SIDRAT Premium T-Shirt & Shirt Brand Bangladesh',
      },
    ],
    locale: 'en_BD',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AS SIDRAT | Premium T-Shirt, Shirt & Clothing Brand Bangladesh',
    description: 'AS SIDRAT - Buy premium t-shirts, linen shirts, bd t-shirts, and modern clothes in Bangladesh.',
    images: ['/images/hero-model.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: '7t916kantTbYn_dqGMqfKi5pitEUT6_74AR_fqWpjf0',
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

import AnalyticsScripts from '@/components/analytics/AnalyticsScripts';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AS SIDRAT',
    alternateName: ['AS SIDRAT', 'Sidrat', 'as sidrat', 'Sidrat Fashion', 'Sidrat T-Shirt', 'AS SIDRAT Clothing', 'Sisrah Fashion'],
    url: BASE_URL,
    logo: settings?.logo || `${BASE_URL}/favicon.png`,
    description: "Bangladesh's premier professional minimalist clothing brand specializing in climate-responsive linen shirts, premium organic cotton t-shirts, and modern menswear.",
    slogan: 'Bangladesh\'s premier professional minimalist clothing brand',
    knowsAbout: [
      'Minimalist Fashion Bangladesh',
      'Linen Shirts BD',
      'Premium T-Shirts Bangladesh',
      'Professional Menswear Bangladesh',
      'Climate-responsive apparel',
      'AS SIDRAT Clothing'
    ],
    foundingLocation: {
      '@type': 'Place',
      name: 'Dhaka, Bangladesh',
    },
    sameAs: [
      settings?.facebookUrl || 'https://www.facebook.com',
      settings?.instagramUrl || 'https://www.instagram.com',
      settings?.youtubeUrl || 'https://www.youtube.com',
    ].filter(Boolean),
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: settings?.whatsappNumber || '+8801733919156',
      contactType: 'customer service',
      areaServed: 'BD',
      availableLanguage: ['en', 'bn'],
    },
  };

  const storeSchema = {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    name: 'AS SIDRAT | Premium T-Shirt & Shirt Brand Bangladesh',
    alternateName: ['Sidrat', 'as sidrat', 'AS SIDRAT Clothing'],
    url: BASE_URL,
    description: 'Buy premium t-shirts, linen shirts, bd t-shirts, and minimalist clothing in Bangladesh with cash on delivery.',
    priceRange: '৳৳',
    currenciesAccepted: 'BDT',
    paymentAccepted: 'Cash on Delivery, Mobile Banking',
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AS SIDRAT',
    url: BASE_URL,
    alternateName: ['AS SIDRAT', 'Sidrat', 'as sidrat', 'Sidrat Fashion', 'AS SIDRAT Clothing', 'Sisrah Fashion'],
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BASE_URL}/shop?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="en" className={`${montserrat.variable} ${hindSiliguri.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://lh3.googleusercontent.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([websiteSchema, organizationSchema, storeSchema]),
          }}
        />
      </head>
      <body className="min-h-screen bg-loomra-white text-loomra-black antialiased font-sans" suppressHydrationWarning>
        <AnalyticsScripts
          facebookPixelId={settings?.facebookPixelId}
          googleAnalyticsId={settings?.googleAnalyticsId}
        />
        <StoreInitializer settings={settings} />
        {children}
      </body>
    </html>
  );
}
