import React from 'react';

interface ProductSchemaProps {
  product: {
    id?: string;
    _id?: string;
    title: string;
    description: string;
    slug: string;
    basePrice: number;
    offerPrice?: number;
    sku?: string;
    category?: string;
    images?: Array<{
      url: string;
      public_id?: string;
    }>;
    rating?: number;
    numReviews?: number;
    variants?: Array<{
      size?: string;
      color?: string;
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
 * Renders JSON-LD Product & Breadcrumb Schema for Google Rich Snippets & Search Console.
 */
export default function ProductSchemaMarkup({
  product,
  baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://assidrat.vercel.app',
}: ProductSchemaProps) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  const currentPrice = product.offerPrice && product.offerPrice > 0 ? product.offerPrice : product.basePrice;
  const originalPrice = product.basePrice;
  const hasDiscount = product.offerPrice && product.offerPrice > 0 && product.offerPrice < product.basePrice;

  // Determine stock availability
  const inStock = product.variants && product.variants.length > 0
    ? product.variants.some(v => v.stock > 0)
    : true;
  const availability = inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';

  const productUrl = `${normalizedBaseUrl}/product/${product.slug}`;

  // Image array (ensuring absolute URLs)
  const rawImages = product.images || [];
  const imageArray = rawImages
    .filter(img => Boolean(img?.url))
    .map(img => (img.url.startsWith('http') ? img.url : `${normalizedBaseUrl}${img.url}`))
    .slice(0, 5);

  if (imageArray.length === 0) {
    imageArray.push(`${normalizedBaseUrl}/images/hero-model.jpg`);
  }

  const sku = product.sku || `${product.slug.toUpperCase()}-${String(product._id || product.id || 'NO-ID').slice(-6)}`;

  const productSchema: Record<string, any> = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    sku: sku,
    productID: String(product._id || product.id || product.slug),
    url: productUrl,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'AS SIDRAT',
    },
    category: product.category || 'Fashion',
    image: imageArray,
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'BDT',
      price: currentPrice.toString(),
      priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      itemCondition: 'https://schema.org/NewCondition',
      availability: availability,
      seller: {
        '@type': 'Organization',
        name: 'AS SIDRAT',
        url: normalizedBaseUrl,
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '60.00',
          currency: 'BDT',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'BD',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 1,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 3,
            unitCode: 'DAY',
          },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'BD',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 7,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
      ...(hasDiscount && {
        priceSpecification: [
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
  };

  if (product.rating && product.numReviews && product.numReviews > 0) {
    productSchema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Number(product.rating).toFixed(1),
      reviewCount: product.numReviews,
      bestRating: '5',
      worstRating: '1',
    };
  }

  const categorySlug = (product.category || 'clothing').toLowerCase().replace(/\s+/g, '-');
  const categoryName = product.category
    ? product.category.charAt(0).toUpperCase() + product.category.slice(1)
    : 'Clothing';

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: normalizedBaseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: categoryName,
        item: `${normalizedBaseUrl}/category/${categorySlug}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.title,
        item: productUrl,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify([productSchema, breadcrumbSchema], null, 0),
      }}
      suppressHydrationWarning
    />
  );
}
