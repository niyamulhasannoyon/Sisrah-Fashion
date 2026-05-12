import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import ProductListing from '@/components/product/ProductListing';

interface CategoryPageProps {
  params: { slug: string };
}

function normalizeCategory(slug: string) {
  const value = slug.replace('-', ' ').toLowerCase();
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params }: CategoryPageProps) {
  await dbConnect();

  const category = normalizeCategory(params.slug);
  const products = await Product.find({ category }).lean();
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

      <ProductListing products={safeProducts} />
    </div>
  );
}
