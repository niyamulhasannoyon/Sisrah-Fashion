import type { Metadata } from 'next';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import ProductListing from '@/components/product/ProductListing';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

function normalizeCategory(slug: string) {
  const value = slug.replace('-', ' ').toLowerCase();
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = normalizeCategory(slug);

  const categoryDescriptions: Record<string, string> = {
    men: "Premium men's clothing crafted for hot climates. Explore minimalist linen shirts, breathable cotton t-shirts, panjabis, and summer essentials from AS SIDRAT.",
    women: "Breathable, minimal, and premium women's collection. Explore linen kaftans, shirts, co-ords, and dresses designed for tropical comfort from AS SIDRAT.",
    fusion: "Modern fusion wear blending tradition and minimal styling. Explore breathable linen and cotton-blend kurtas, panjabis, and co-ords from AS SIDRAT.",
    accessories: "Minimalist accessories to complement your premium attire. Shop premium leather goods, bags, and essentials from AS SIDRAT."
  };

  const description = categoryDescriptions[slug.toLowerCase()] || `Shop premium ${category} collection at AS SIDRAT. Breathable, climate-conscious minimalist wear.`;
  const url = `https://assidrat.com/category/${slug}`;

  return {
    title: `${category} Collection - AS SIDRAT | Buy clothing in Bangladesh`,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${category} Collection - AS SIDRAT | Buy clothing in Bangladesh`,
      description,
      url,
      type: 'website',
      siteName: 'AS SIDRAT',
      locale: 'en_BD',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category} Collection - AS SIDRAT | Buy clothing in Bangladesh`,
      description,
    }
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  await dbConnect();

  const { slug } = await params;
  const category = normalizeCategory(slug);
  const products = await Product.find({
    category: { $regex: new RegExp(`^${slug.replace('-', ' ')}$`, 'i') }
  }).lean();
  const safeProducts = JSON.parse(JSON.stringify(products));

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-12">
      <header className="mb-8">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Category</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">{category}</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Discover breathable essentials tailored for the Bangladesh climate and premium craftsmanship that feels effortless.
        </p>
      </header>

      <ProductListing products={safeProducts} categoryName={category} />
    </div>
  );
}
