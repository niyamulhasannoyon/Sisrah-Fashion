import type { Metadata } from 'next';

export interface ProductMetadataInput {
  title: string;
  description: string;
  slug: string;
  basePrice: number;
  offerPrice?: number;
  images?: { url: string; public_id?: string }[];
  category?: string;
  tags?: string[];
  rating?: number;
  numReviews?: number;
  variants?: Array<{ stock: number }>;
}

/**
 * Truncates text to a maximum length for meta descriptions (under 160 chars)
 */
const truncateText = (text: string | undefined, maxLength: number = 158): string => {
  if (!text) return 'Explore premium clothing, t-shirts & linen shirts at AS SIDRAT in Bangladesh.';
  const cleaned = text.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.substring(0, maxLength).trim() + '...';
};

/**
 * Capitalizes category name for clean title formatting
 */
const formatCategory = (category?: string): string => {
  if (!category || !category.trim()) return 'Clothing';
  const cleanCat = category.trim();
  return cleanCat.charAt(0).toUpperCase() + cleanCat.slice(1);
};

/**
 * Generates comprehensive dynamic SEO metadata for product pages
 * Enforces title pattern: [Product Name] - Best [Category] in Bangladesh | AS SIDRAT
 */
export function generateProductMetadata(
  product: ProductMetadataInput,
  baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || 'https://assidrat.vercel.app'
): Metadata {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  const productTitle = product.title?.trim() || 'Premium Apparel';
  const categoryFormatted = formatCategory(product.category);

  // Required title format: [Product Name] - Premium [Category] Price in BD | AS SIDRAT
  const seoTitle = `${productTitle} - Premium ${categoryFormatted} Price in BD | AS SIDRAT`;

  const metaDescription = truncateText(
    `${product.description ? product.description + ' ' : ''}Buy ${productTitle} online in Bangladesh from AS SIDRAT. 100% combed compact cotton, 220 GSM heavyweight fabric, and cash on delivery across BD.`
  );

  const rawImage = product.images?.[0]?.url;
  const productImage = rawImage
    ? rawImage.startsWith('http')
      ? rawImage
      : `${normalizedBaseUrl}${rawImage}`
    : `${normalizedBaseUrl}/images/hero-model.jpg`;

  const displayPrice = product.offerPrice && product.offerPrice > 0 ? product.offerPrice : product.basePrice;
  const currency = 'BDT';
  const canonicalUrl = `${normalizedBaseUrl}/product/${product.slug}`;
  const inStock = !product.variants || product.variants.length === 0 || product.variants.some(v => v.stock > 0);

  const keywords = Array.from(
    new Set([
      productTitle.toLowerCase(),
      `${productTitle.toLowerCase()} bd`,
      `${productTitle.toLowerCase()} price in bangladesh`,
      'best t-shirt brand in bangladesh',
      'premium t-shirt bd',
      'buy t-shirt online bangladesh',
      '220 gsm t shirt bangladesh',
      'combed compact cotton t shirt',
      'সেরা টি শার্ট বাংলাদেশ',
      'প্রিমিয়াম টি শার্ট দাম বাংলাদেশ',
      'অনলাইনে টি শার্ট কিনুন',
      categoryFormatted.toLowerCase(),
      ...(product.tags || []).map(t => t.toLowerCase()),
      'shirt',
      't-shirt',
      'men fashion bangladesh',
      'as sidrat',
      'sidrat',
      'premium clothing',
      'linen shirt bd',
      'bd t shirt',
      'online shopping bd',
    ])
  );

  return {
    title: seoTitle,
    description: metaDescription,
    keywords,
    metadataBase: new URL(normalizedBaseUrl),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en-BD': canonicalUrl,
        'bn-BD': canonicalUrl,
      },
    },
    openGraph: {
      title: seoTitle,
      description: metaDescription,
      url: canonicalUrl,
      type: 'website',
      siteName: 'AS SIDRAT',
      locale: 'en_BD',
      images: [
        {
          url: productImage,
          width: 1200,
          height: 630,
          alt: `${productTitle} - AS SIDRAT Bangladesh`,
          type: 'image/jpeg',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: metaDescription,
      images: [productImage],
      creator: '@AS_SIDRAT',
    },
    other: {
      'product:price:amount': displayPrice.toString(),
      'product:price:currency': currency,
      'product:category': categoryFormatted,
      'product:availability': inStock ? 'In Stock' : 'Out of Stock',
      ...(product.rating ? { 'product:rating': product.rating.toString() } : {}),
      ...(product.numReviews ? { 'product:review_count': product.numReviews.toString() } : {}),
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  };
}
