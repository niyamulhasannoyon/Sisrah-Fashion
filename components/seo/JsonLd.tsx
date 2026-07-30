import React from 'react';

interface JsonLdProps {
  data: Record<string, any> | Array<Record<string, any>>;
}

/**
 * JsonLd Component
 * 
 * Safe server/client component for rendering JSON-LD structured data into Next.js App Router pages
 */
export default function JsonLd({ data }: JsonLdProps) {
  if (!data) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 0),
      }}
      suppressHydrationWarning
    />
  );
}
