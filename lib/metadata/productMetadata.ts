import type { Metadata } from 'next';

export interface ProductMetadataInput {
  title: string;
  description: string;
  slug: string;
  basePrice: number;
  offerPrice?: number;
  images?: { url: string; public_id: string }[];
  category?: string;
  tags?: string[];
  rating?: number;
  numReviews?: number;
  variants?: Array<{ stock: number }>;
}

/**
 * Truncates text to a maximum length, adding ellipsis if needed
 * Useful for keeping meta descriptions under 160 characters
 */
const truncateText = (text: string | undefined, maxLength: number = 160): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Checks if product is in stock
 */
const isInStock = (variants?: Array<{ stock: number }>): boolean => {
  if (!variants || variants.length === 0) return true;
  return variants.some(v => v.stock > 0);
};

/**
 * Generates comprehensive SEO metadata for product pages
 * Supports Open Graph, Twitter Cards, and structured data
 */
export function generateProductMetadata(product: ProductMetadataInput, baseUrl: string = 'https://assidrat.com'): Metadata {
  const productTitle = product.title || 'Premium Fashion';
  const productDescription = truncateText(product.description, 160);
  const productImage = product.images?.[0]?.url || '/images/placeholder.jpg';
  const displayPrice = product.offerPrice && product.offerPrice > 0 ? product.offerPrice : product.basePrice;
  const currency = 'BDT';
  const productUrl = `${baseUrl}/product/${product.slug}`;
  const inStock = isInStock(product.variants);

  // Structured data for Google Rich Snippets
  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productTitle,
    description: productDescription,
    image: productImage,
    brand: {
      '@type': 'Brand',
      name: 'AS SIDRAT',
    },
    url: productUrl,
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: currency,
      price: displayPrice.toString(),
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
    ...(product.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating.toString(),
        reviewCount: (product.numReviews || 0).toString(),
      },
    }),
  };

  return {
    title: `${productTitle} - AS SIDRAT | Buy Shirt Online Bangladesh`,
    description: productDescription,
    keywords: [
      productTitle,
      product.category || 'Fashion',
      ...(product.tags || []),
      'AS SIDRAT',
      'Premium Fashion Bangladesh',
      'Premium Clothing Dhaka',
    ],
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title: `${productTitle} - AS SIDRAT | Buy Shirt Online Bangladesh`,
      description: productDescription,
      url: productUrl,
      type: 'website',
      images: [
        {
          url: productImage,
          width: 1200,
          height: 800,
          alt: productTitle,
          type: 'image/jpeg',
        },
      ],
      siteName: 'AS SIDRAT',
      locale: 'en_BD',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${productTitle} - AS SIDRAT | Buy Shirt Online Bangladesh`,
      description: productDescription,
      images: [productImage],
      creator: '@AS_SIDRAT',
    },
    other: {
      'product:price:amount': displayPrice.toString(),
      'product:price:currency': currency,
      'product:category': product.category || 'Fashion',
      'product:availability': inStock ? 'In Stock' : 'Out of Stock',
      ...(product.rating && {
        'product:rating': product.rating.toString(),
        'product:review_count': (product.numReviews || 0).toString(),
      }),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
