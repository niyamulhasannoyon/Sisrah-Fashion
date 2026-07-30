import React from 'react';

interface OrganizationSchemaProps {
  settings?: {
    logo?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    youtubeUrl?: string;
    whatsappNumber?: string;
  } | null;
  baseUrl?: string;
}

/**
 * OrganizationSchema Component
 * 
 * Generates Schema.org Organization, WebSite (with SearchAction), and OnlineStore structured data
 */
export default function OrganizationSchema({
  settings,
  baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://assidrat.vercel.app',
}: OrganizationSchemaProps) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AS SIDRAT',
    url: normalizedBaseUrl,
    alternateName: ['AS SIDRAT', 'Sidrat', 'as sidrat', 'Sidrat Fashion', 'AS SIDRAT Clothing', 'Sisrah Fashion'],
    potentialAction: {
      '@type': 'SearchAction',
      target: `${normalizedBaseUrl}/shop?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AS SIDRAT',
    alternateName: ['AS SIDRAT', 'Sidrat', 'as sidrat', 'Sidrat Fashion', 'Sidrat T-Shirt', 'AS SIDRAT Clothing', 'Sisrah Fashion'],
    url: normalizedBaseUrl,
    logo: settings?.logo || `${normalizedBaseUrl}/favicon.png`,
    description: "Bangladesh's premier minimalist clothing brand specializing in climate-responsive linen shirts, premium organic cotton t-shirts, and modern menswear.",
    slogan: "Bangladesh's premier professional minimalist clothing brand",
    knowsAbout: [
      'Minimalist Fashion Bangladesh',
      'Linen Shirts BD',
      'Premium T-Shirts Bangladesh',
      'Professional Menswear Bangladesh',
      'Climate-responsive apparel',
      'AS SIDRAT Clothing',
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
    url: normalizedBaseUrl,
    description: 'Buy premium t-shirts, linen shirts, bd t-shirts, and minimalist clothing in Bangladesh with cash on delivery.',
    priceRange: '৳৳',
    currenciesAccepted: 'BDT',
    paymentAccepted: 'Cash on Delivery, Mobile Banking',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify([websiteSchema, organizationSchema, storeSchema], null, 0),
      }}
      suppressHydrationWarning
    />
  );
}
