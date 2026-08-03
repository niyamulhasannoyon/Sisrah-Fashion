import type { Metadata } from 'next';
import { Montserrat, Hind_Siliguri } from 'next/font/google';
import './globals.css';
import StoreInitializer from '@/components/layout/StoreInitializer';
import AnalyticsScripts from '@/components/analytics/AnalyticsScripts';
import OrganizationSchema from '@/components/seo/OrganizationSchema';
import WebSiteSchema from '@/components/seo/WebSiteSchema';
import dbConnect from '@/lib/dbConnect';
import Settings from '@/models/Settings';
import { getDirectImageLink } from '@/lib/utils';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali'],
  variable: '--font-hind-siliguri',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'https://assidrat.vercel.app').replace(/\/+$/, '');

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'AS SIDRAT (Sidrat) | Premium T-Shirt, Shirt & Clothing Brand Bangladesh',
    template: '%s | AS SIDRAT (Sidrat)',
  },
  description: "AS SIDRAT (Sidrat) is Bangladesh's premier online fashion & clothing brand for premium t-shirts, linen shirts, bd t-shirts, and modern minimalist menswear. High quality fabrics with cash on delivery across Bangladesh.",
  keywords: [
    'sidrat',
    'Sidrat',
    'SIDRAT',
    'as sidrat',
    'AS SIDRAT',
    'sidrat fashion',
    'sidrat clothing',
    'sidrat t shirt',
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
    'men fashion bangladesh',
    'Sisrah Fashion',
  ],
  authors: [{ name: 'AS SIDRAT (Sidrat)', url: BASE_URL }],
  creator: 'AS SIDRAT',
  publisher: 'AS SIDRAT',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: BASE_URL,
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png', sizes: '512x512' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
    ],
    shortcut: '/favicon.png',
    apple: [
      { url: '/apple-icon.png', sizes: '180x180' },
    ],
  },
  openGraph: {
    title: 'AS SIDRAT (Sidrat) | Premium T-Shirt, Shirt & Clothing Brand Bangladesh',
    description: 'AS SIDRAT (Sidrat) - Buy premium t-shirts, linen shirts, bd t-shirts, and modern clothing in Bangladesh with Cash on Delivery.',
    url: BASE_URL,
    siteName: 'AS SIDRAT | Sidrat Fashion BD',
    images: [
      {
        url: `${BASE_URL}/images/hero-model.jpg`,
        width: 1200,
        height: 630,
        alt: 'AS SIDRAT (Sidrat) Premium T-Shirt & Shirt Brand Bangladesh',
      },
    ],
    locale: 'en_BD',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AS SIDRAT (Sidrat) | Premium T-Shirt, Shirt & Clothing Brand Bangladesh',
    description: 'AS SIDRAT (Sidrat) - Buy premium t-shirts, linen shirts, bd t-shirts, and modern clothes in Bangladesh.',
    images: [`${BASE_URL}/images/hero-model.jpg`],
    creator: '@AS_SIDRAT',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: '7t916kantTbYn_dqGMqfKi5pitEUT6_74AR_fqWpjf0',
  },
};

export const revalidate = 60;

async function getSettings() {
  try {
    await dbConnect();
    let settings = await Settings.findOne().lean();
    if (!settings) {
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
  const faviconUrl = settings?.favicon ? getDirectImageLink(settings.favicon) : null;

  return (
    <html lang="en" className={`${montserrat.variable} ${hindSiliguri.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://lh3.googleusercontent.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        {faviconUrl ? (
          <link rel="icon" href={faviconUrl} />
        ) : (
          <>
            <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
            <link rel="icon" href="/favicon.png" type="image/png" sizes="512x512" />
            <link rel="icon" href="/icon.png" type="image/png" sizes="32x32" />
            <link rel="apple-touch-icon" href="/apple-icon.png" sizes="180x180" />
          </>
        )}
        <OrganizationSchema settings={settings} baseUrl={BASE_URL} />
        <WebSiteSchema baseUrl={BASE_URL} />
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
