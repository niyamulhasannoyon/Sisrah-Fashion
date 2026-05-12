import { Filter } from 'lucide-react';
import MotionProductCard from './MotionProductCard';

interface ProductListingProps {
  products: Array<{
    _id: string;
    title: string;
    slug: string;
    category: string;
    basePrice: number;
    discountPrice?: number;
    images?: { url: string }[];
  }>;
}

export default function ProductListing({ products }: ProductListingProps) {
  return (
    <div className="container mx-auto px-16px py-32px flex flex-col md:flex-row gap-40px">
      <aside className="hidden md:flex w-64 flex-col gap-32px shrink-0">
        <div>
          <h3 className="text-body font-bold text-loomra-black mb-16px">Categories</h3>
          <ul className="flex flex-col gap-8px text-small text-loomra-muted">
            <li className="hover:text-loomra-red cursor-pointer transition">Dresses (24)</li>
            <li className="hover:text-loomra-red cursor-pointer transition">Tops (41)</li>
            <li className="hover:text-loomra-red cursor-pointer transition">Linen Trousers (12)</li>
          </ul>
        </div>

        <hr className="border-loomra-surface" />

        <div>
          <h3 className="text-body font-bold text-loomra-black mb-16px">Price Range</h3>
          <div className="flex gap-8px items-center">
            <input type="text" placeholder="Min" className="w-full border border-loomra-surface p-2 text-small" />
            <span>-</span>
            <input type="text" placeholder="Max" className="w-full border border-loomra-surface p-2 text-small" />
          </div>
        </div>
      </aside>

      <div className="flex-1">
        <div className="flex justify-between items-center mb-24px pb-16px border-b border-loomra-surface">
          <button className="md:hidden flex items-center gap-8px text-small font-bold uppercase">
            <Filter size={16} /> Filters
          </button>
          <span className="hidden md:block text-small text-loomra-muted">Showing {products.length} products</span>
          <select className="border-none bg-transparent text-small font-medium text-loomra-black focus:ring-0 cursor-pointer">
            <option>Sort by: Newest</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-12px gap-y-24px md:gap-x-24px md:gap-y-32px">
          {products.map(product => (
            <MotionProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
