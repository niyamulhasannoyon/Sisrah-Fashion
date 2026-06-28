import { Filter, ShoppingBag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
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
  categoryName?: string;
  aspectRatio?: 'portrait' | 'square';
}

export default function ProductListing({ 
  products, 
  categoryName, 
  aspectRatio = 'portrait' 
}: ProductListingProps) {
  // Get active category from props or first product
  const activeCategory = categoryName || products[0]?.category || 'Shop';

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

  if (products.length === 0) {
    const isSpecialCategory = activeCategory && ['men', 'women', 'fusion', 'kids', 'accessories'].includes(activeCategory.toLowerCase());
    const message = isSpecialCategory 
      ? `Our ${activeCategory} collection is dropping soon!` 
      : "Our new collection is dropping soon!";

    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center text-center px-6 py-16 bg-[#F9F9F9] border border-gray-100 rounded-2xl shadow-sm">
        {/* Animated Shopping Bag Icon */}
        <div className="relative w-20 h-20 bg-white border border-gray-100 shadow-md rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={32} className="text-[#A31F24] opacity-80" />
          <div className="absolute inset-0 rounded-full border border-[#A31F24]/10 animate-ping" />
        </div>
        
        {/* Messaging */}
        <h3 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] mb-3">
          Coming Soon
        </h3>
        <p className="max-w-md text-sm text-gray-500 leading-relaxed mb-8">
          {message} We are busy crafting premium, breathable essentials for your wardrobe. Stay tuned!
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 border border-[#1A1A1A] bg-[#1A1A1A] text-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-transparent hover:text-black transition-all duration-300 rounded-none shadow-md active:scale-98"
          >
            Shop All
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 border border-gray-200 bg-transparent text-gray-700 px-8 py-3.5 text-xs font-bold uppercase tracking-widest hover:border-black hover:text-black transition-all duration-300 rounded-none active:scale-98"
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

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
            <MotionProductCard key={product._id} product={product} aspectRatio={aspectRatio} />
          ))}
        </div>
      </div>
    </div>
  );
}
