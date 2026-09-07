import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import ProductDetailsClient from '@/components/product/ProductDetailsClient';
import ProductSchemaMarkup from '@/components/seo/ProductSchemaMarkup';
import { generateProductMetadata } from '@/lib/metadata/productMetadata';
import { getCachedProduct, getCachedProductReviews } from '@/lib/dataCache';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    await dbConnect();
    const products = await Product.find({}).select('slug').sort({ createdAt: -1 }).limit(30).lean();
    return products.map((p: any) => ({ slug: p.slug }));
  } catch (err) {
    console.error('[Product Page] Failed to generateStaticParams:', err);
    return [];
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = (await getCachedProduct(slug)) as any;

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
  const { slug } = await params;
  const product = (await getCachedProduct(slug)) as any;

  if (!product) {
    notFound();
  }

  const reviewsData = await getCachedProductReviews(product._id);

  return (
    <>
      <ProductSchemaMarkup product={product} reviews={reviewsData} />
      <ProductDetailsClient product={product} reviews={reviewsData} />
    </>
  );
}
