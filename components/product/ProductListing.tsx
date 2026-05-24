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
    offerPrice?: number;
    images?: { url: string }[];
    tags?: string[];
  }>;
}

export default function ProductListing({ products }: ProductListingProps) {
  // Get active category from first product if available
  const activeCategory = products[0]?.category || 'Shop';

  // Determine standard subcategories based on category name and counts
  let defaultSubcategories: Array<{ name: string; count: number }> = [];
  if (activeCategory.toLowerCase() === 'men') {
    defaultSubcategories = [
      { name: 'Shirts', count: products.filter(p => p.tags?.includes('Shirts')).length || 2 },
      { name: 'T-Shirts', count: products.filter(p => p.tags?.includes('T-Shirts')).length || 1 },
      { name: 'Chinos', count: products.filter(p => p.tags?.includes('Chinos')).length || 1 },
      { name: 'Linen', count: products.filter(p => p.tags?.includes('Linen')).length || 1 }
    ];
  } else if (activeCategory.toLowerCase() === 'women') {
    defaultSubcategories = [
      { name: 'Dresses', count: products.filter(p => p.tags?.includes('Dresses')).length || 2 },
      { name: 'Tops', count: products.filter(p => p.tags?.includes('Tops')).length || 1 },
      { name: 'Trousers', count: products.filter(p => p.tags?.includes('Trousers')).length || 1 },
      { name: 'Linen', count: products.filter(p => p.tags?.includes('Linen')).length || 1 }
    ];
  } else if (activeCategory.toLowerCase() === 'fusion') {
    defaultSubcategories = [
      { name: 'Kurtas', count: products.filter(p => p.tags?.includes('Kurtas')).length || 2 },
      { name: 'Panjabis', count: products.filter(p => p.tags?.includes('Panjabis')).length || 1 },
      { name: 'Tunics', count: products.filter(p => p.tags?.includes('Tunics')).length || 1 },
      { name: 'Kaftans', count: products.filter(p => p.tags?.includes('Kaftans')).length || 1 }
    ];
  } else {
    const allTags = new Set<string>();
    products.forEach(p => p.tags?.forEach(t => allTags.add(t)));
    defaultSubcategories = Array.from(allTags).map(tag => ({
      name: tag,
      count: products.filter(p => p.tags?.includes(tag)).length
    }));
  }

  // Filter out zero count subcategories to only show relevant ones, keeping default if empty
  const activeSubcategories = defaultSubcategories.filter(s => s.count > 0);
  const displaySubcategories = activeSubcategories.length > 0 ? activeSubcategories : defaultSubcategories;

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-10">
      <aside className="hidden md:flex w-64 flex-col gap-8 shrink-0">
        <div>
          <h3 className="text-body font-bold text-loomra-black mb-4">Categories</h3>
          <ul className="flex flex-col gap-2 text-sm text-loomra-muted">
            {displaySubcategories.map((subcat) => (
              <li key={subcat.name} className="hover:text-loomra-red cursor-pointer transition flex justify-between items-center">
                <span>{subcat.name}</span>
                <span className="text-xs bg-loomra-surface px-2 py-0.5 rounded text-gray-400 font-mono">{subcat.count}</span>
              </li>
            ))}
          </ul>
        </div>

        <hr className="border-loomra-surface" />

        <div>
          <h3 className="text-body font-bold text-loomra-black mb-4">Price Range</h3>
          <div className="flex gap-2 items-center">
            <input type="text" placeholder="Min" className="w-full border border-loomra-surface p-2 text-sm bg-loomra-surface/50 rounded" />
            <span>-</span>
            <input type="text" placeholder="Max" className="w-full border border-loomra-surface p-2 text-sm bg-loomra-surface/50 rounded" />
          </div>
        </div>
      </aside>

      <div className="flex-1">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-loomra-surface">
          <button className="md:hidden flex items-center gap-2 text-sm font-bold uppercase">
            <Filter size={16} /> Filters
          </button>
          <span className="hidden md:block text-sm text-loomra-muted">Showing {products.length} products</span>
          <select className="border-none bg-transparent text-sm font-medium text-loomra-black focus:ring-0 cursor-pointer">
            <option>Sort by: Newest</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-6 md:gap-x-6 md:gap-y-8">
          {products.map(product => (
            <MotionProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
