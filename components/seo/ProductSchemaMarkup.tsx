'use client';

import React from 'react';

interface ProductSchemaProps {
  product: {
    id?: string;
    title: string;
    description: string;
    slug: string;
    basePrice: number;
    offerPrice?: number;
    sku?: string;
    category?: string;
    images: Array<{
      url: string;
      public_id?: string;
    }>;
    rating?: number;
    numReviews?: number;
    variants?: Array<{
      size: string;
      color: string;
      stock: number;
      price?: number;
    }>;
    brand?: string;
  };
  baseUrl?: string;
}

/**
 * ProductSchemaMarkup Component
 * 
 * Renders JSON-LD Product Schema for SEO and rich snippets
 * Supports Google Search Console, social media crawlers, and voice assistants
 * 
 * @param product - Product data from database
 * @param baseUrl - Base URL of your site (default: https://assidrat.com)
 */
export default function ProductSchemaMarkup({ product, baseUrl = 'https://assidrat.com' }: ProductSchemaProps) {
  // Determine current price and discount
  const currentPrice = product.offerPrice && product.offerPrice > 0 ? product.offerPrice : product.basePrice;
  const originalPrice = product.basePrice;
  const hasDiscount = product.offerPrice && product.offerPrice > 0 && product.offerPrice < product.basePrice;

  // Determine stock availability
  const inStock = product.variants?.some(v => v.stock > 0) ?? true;
  const availability = inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';

  // Generate product URL
  const productUrl = `${baseUrl}/product/${product.slug}`;

  // Map images to proper schema format
  const imageArray = product.images
    .filter(img => img.url) // Filter out empty images
    .map(img => img.url)
    .slice(0, 3); // Limit to 3 images per Google recommendations

  // Generate SKU (fallback to slug if not provided)
  const sku = product.sku || `${product.slug.toUpperCase()}-${product.id?.slice(-6) || 'NO-ID'}`;

  /**
   * JSON-LD Product Schema Object
   * Fully compliant with schema.org specifications
   */
  const schemaMarkup = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    // Basic Product Information
    name: product.title,
    description: product.description,
    sku: sku,
    productID: product.id || product.slug,
    url: productUrl,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'AS SIDRAT',
    },
    category: product.category || 'Fashion',
    // Product Images (maximum 3 recommended)
    image: imageArray,
    // Pricing Information
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'BDT',
      price: currentPrice.toString(),
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Valid for 30 days
      itemCondition: 'https://schema.org/NewCondition',
      availability: availability,
      seller: {
        '@type': 'Organization',
        name: 'AS SIDRAT',
        url: baseUrl,
      },
      // Include original price if there's a discount
      ...(hasDiscount && {
        priceCurrency: 'BDT',
        price: currentPrice.toString(),
        'priceSpecification': [
          {
            '@type': 'PriceSpecification',
            priceCurrency: 'BDT',
            price: currentPrice.toString(),
            priceType: 'https://schema.org/SalePrice',
          },
          {
            '@type': 'PriceSpecification',
            priceCurrency: 'BDT',
            price: originalPrice.toString(),
            priceType: 'https://schema.org/ListPrice',
          },
        ],
      }),
    },
    // Customer Reviews and Ratings (if available)
    ...(product.rating &&
      product.numReviews && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: product.rating.toFixed(1),
          reviewCount: product.numReviews,
          bestRating: '5',
          worstRating: '1',
        },
      }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup, null, 2) }}
      suppressHydrationWarning
    />
  );
}
