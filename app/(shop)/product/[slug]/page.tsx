import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import Review from '@/models/Review';
import ProductDetailsClient from '@/components/product/ProductDetailsClient';
import { generateProductMetadata } from '@/lib/metadata/productMetadata';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  await dbConnect();

  const { slug } = await params;
  const product = (await Product.findOne({ slug }).lean()) as any;

  if (!product) {
    return {
      title: 'Product Not Found - AS SIDRAT',
      description: 'The product you are looking for is not available.',
    };
  }

  // Use the reusable metadata generator
  return generateProductMetadata({
    title: product.title,
    description: product.description,
    slug: product.slug,
    basePrice: product.basePrice,
    offerPrice: product.offerPrice,
    images: product.images,
    category: product.category,
    tags: product.tags,
    rating: product.rating,
    numReviews: product.numReviews,
    variants: product.variants,
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  await dbConnect();

  const { slug } = await params;
  const product = (await Product.findOne({ slug }).lean()) as any;

  if (!product) {
    notFound();
  }

  const reviews = await Review.find({ product: product._id, status: 'approved' }).sort({ createdAt: -1 }).limit(10).lean();

  const productData = JSON.parse(JSON.stringify(product));
  const reviewsData = JSON.parse(JSON.stringify(reviews));

  const displayPrice = product.offerPrice && product.offerPrice > 0 ? product.offerPrice : product.basePrice;
  const inStock = product.variants?.some((v: any) => v.stock > 0);
  const productImage = product.images?.[0]?.url || '/images/placeholder.jpg';
  const productUrl = `https://assidrat.com/product/${product.slug}`;

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: productImage,
    brand: {
      '@type': 'Brand',
      name: 'AS SIDRAT',
    },
    sku: product._id.toString(),
    url: productUrl,
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'BDT',
      price: displayPrice.toString(),
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    ...(product.rating && product.numReviews > 0 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating.toString(),
        reviewCount: product.numReviews.toString(),
        bestRating: '5',
        worstRating: '1',
      }
    } : {})
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema),
        }}
      />
      <ProductDetailsClient product={productData} reviews={reviewsData} />
    </>
  );
}
