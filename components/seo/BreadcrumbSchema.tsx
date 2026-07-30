import React from 'react';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
  baseUrl?: string;
}

/**
 * BreadcrumbSchema Component
 * 
 * Generates Schema.org BreadcrumbList JSON-LD structured data
 */
export default function BreadcrumbSchema({
  items,
  baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://assidrat.vercel.app',
}: BreadcrumbSchemaProps) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');

  const listItems = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: normalizedBaseUrl,
    },
    ...items.map((item, index) => {
      const fullUrl = item.url.startsWith('http')
        ? item.url
        : `${normalizedBaseUrl}${item.url.startsWith('/') ? '' : '/'}${item.url}`;
        
      return {
        '@type': 'ListItem',
        position: index + 2,
        name: item.name,
        item: fullUrl,
      };
    }),
  ];

  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: listItems,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(breadcrumbData, null, 0),
      }}
      suppressHydrationWarning
    />
  );
}
