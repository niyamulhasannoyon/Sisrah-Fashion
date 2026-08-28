import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import Review from '@/models/Review';
import ProductDetailsClient from '@/components/product/ProductDetailsClient';
import ProductSchemaMarkup from '@/components/seo/ProductSchemaMarkup';
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
      description: 'The requested clothing item is not available at AS SIDRAT.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

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

  const reviews = await Review.find({ product: product._id, status: 'approved' })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  const productData = JSON.parse(JSON.stringify(product));
  const reviewsData = JSON.parse(JSON.stringify(reviews));

  return (
    <>
      <ProductSchemaMarkup product={productData} reviews={reviewsData} />
      <ProductDetailsClient product={productData} reviews={reviewsData} />
    </>
  );
}
