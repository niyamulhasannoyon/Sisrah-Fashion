import { notFound } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import Review from '@/models/Review';
import ProductDetailsClient from '@/components/product/ProductDetailsClient';

interface ProductPageProps {
  params: { slug: string };
}

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: ProductPageProps) {
  await dbConnect();

  const product = (await Product.findOne({ slug: params.slug }).lean()) as any;

  if (!product) {
    notFound();
  }

  const reviews = await Review.find({ product: product._id }).sort({ createdAt: -1 }).limit(5).lean();

  const productData = JSON.parse(JSON.stringify(product));
  const reviewsData = JSON.parse(JSON.stringify(reviews));

  return <ProductDetailsClient product={productData} reviews={reviewsData} />;
}
