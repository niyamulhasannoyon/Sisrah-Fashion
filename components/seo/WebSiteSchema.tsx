import React from 'react';

interface WebSiteSchemaProps {
  baseUrl?: string;
}

/**
 * WebSiteSchema Component
 * 
 * Renders JSON-LD WebSite & SearchAction schema for Google Sitelinks Searchbox & search readiness.
 */
export default function WebSiteSchema({
  baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://assidrat.vercel.app',
}: WebSiteSchemaProps) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AS SIDRAT (Sidrat)',
    alternateName: ['AS SIDRAT', 'Sidrat', 'Sidrat BD', 'Sidrat Fashion'],
    url: normalizedBaseUrl,
    description: 'Premier online fashion & clothing brand in Bangladesh for premium t-shirts, linen shirts, and modern menswear.',
    inLanguage: 'en-BD',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${normalizedBaseUrl}/shop?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(websiteSchema, null, 0),
      }}
      suppressHydrationWarning
    />
  );
}
