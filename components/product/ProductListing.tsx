'use client';

import { useState, useMemo } from 'react';
import { Filter, ShoppingBag, ArrowLeft, X } from 'lucide-react';
import Link from 'next/link';
import MotionProductCard from './MotionProductCard';
import { AnimatePresence, motion } from 'framer-motion';

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
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('Newest');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Get active category from props or first product
  const activeCategory = categoryName || products[0]?.category || 'Shop';

  // Determine standard subcategories based on category name and counts
  let defaultSubcategories: Array<{ name: string; count: number }> = [];
  if (activeCategory.toLowerCase() === 'men') {
    defaultSubcategories = [
      { name: 'Shirts', count: products.filter(p => p.tags?.includes('Shirts')).length },
      { name: 'T-Shirts', count: products.filter(p => p.tags?.includes('T-Shirts')).length },
      { name: 'Chinos', count: products.filter(p => p.tags?.includes('Chinos')).length },
      { name: 'Linen', count: products.filter(p => p.tags?.includes('Linen')).length }
    ];
  } else if (activeCategory.toLowerCase() === 'women') {
    defaultSubcategories = [
      { name: 'Dresses', count: products.filter(p => p.tags?.includes('Dresses')).length },
      { name: 'Tops', count: products.filter(p => p.tags?.includes('Tops')).length },
      { name: 'Trousers', count: products.filter(p => p.tags?.includes('Trousers')).length },
      { name: 'Linen', count: products.filter(p => p.tags?.includes('Linen')).length }
    ];
  } else if (activeCategory.toLowerCase() === 'fusion') {
    defaultSubcategories = [
      { name: 'Kurtas', count: products.filter(p => p.tags?.includes('Kurtas')).length },
      { name: 'Panjabis', count: products.filter(p => p.tags?.includes('Panjabis')).length },
      { name: 'Tunics', count: products.filter(p => p.tags?.includes('Tunics')).length },
      { name: 'Kaftans', count: products.filter(p => p.tags?.includes('Kaftans')).length }
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

  const getProductPrice = (p: any) => {
    return p.offerPrice && p.offerPrice > 0 && p.offerPrice < p.basePrice
      ? p.offerPrice
      : p.basePrice;
  };

  // Perform Client-side filtering & sorting
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by subcategory
    if (selectedSubcategory !== 'All') {
      result = result.filter(p => p.tags?.includes(selectedSubcategory));
    }

    // Filter by min price
    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        result = result.filter(p => getProductPrice(p) >= min);
      }
    }

    // Filter by max price
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        result = result.filter(p => getProductPrice(p) <= max);
      }
    }

    // Sorting
    if (sortBy === 'Price: Low to High') {
      result.sort((a, b) => getProductPrice(a) - getProductPrice(b));
    } else if (sortBy === 'Price: High to Low') {
      result.sort((a, b) => getProductPrice(b) - getProductPrice(a));
    }

    return result;
  }, [products, selectedSubcategory, minPrice, maxPrice, sortBy]);

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
      {/* Desktop Filter Sidebar */}
      <aside className="hidden md:flex w-64 flex-col gap-8 shrink-0">
        <div>
          <h3 className="text-body font-bold text-loomra-black mb-4">Categories</h3>
          <ul className="flex flex-col gap-2 text-sm text-loomra-muted">
            <li 
              onClick={() => setSelectedSubcategory('All')} 
              className={`hover:text-loomra-red cursor-pointer transition flex justify-between items-center ${selectedSubcategory === 'All' ? 'text-loomra-red font-bold' : ''}`}
            >
              <span>All Items</span>
              <span className="text-xs bg-loomra-surface px-2 py-0.5 rounded text-gray-400 font-mono">{products.length}</span>
            </li>
            {displaySubcategories.map((subcat) => (
              <li 
                key={subcat.name} 
                onClick={() => setSelectedSubcategory(subcat.name)}
                className={`hover:text-loomra-red cursor-pointer transition flex justify-between items-center ${selectedSubcategory === subcat.name ? 'text-loomra-red font-bold' : ''}`}
              >
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
            <input 
              type="number" 
              placeholder="Min" 
              value={minPrice} 
              onChange={(e) => setMinPrice(e.target.value)} 
              className="w-full border border-loomra-surface p-2 text-sm bg-loomra-surface/50 rounded outline-none focus:border-loomra-black transition-colors" 
            />
            <span>-</span>
            <input 
              type="number" 
              placeholder="Max" 
              value={maxPrice} 
              onChange={(e) => setMaxPrice(e.target.value)} 
              className="w-full border border-loomra-surface p-2 text-sm bg-loomra-surface/50 rounded outline-none focus:border-loomra-black transition-colors" 
            />
          </div>
        </div>
      </aside>

      {/* Product Grid and Mobile Controls */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-loomra-surface">
          <button 
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-2 bg-[#F9F9F9] border border-gray-200 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-loomra-black shadow-sm"
          >
            <Filter size={14} /> Filters
          </button>
          
          <span className="hidden md:block text-sm text-loomra-muted">
            Showing {filteredProducts.length} of {products.length} products
          </span>
          <span className="md:hidden text-xs text-loomra-muted font-medium">
            {filteredProducts.length} items
          </span>

          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border-none bg-transparent text-xs sm:text-sm font-semibold text-loomra-black focus:ring-0 cursor-pointer outline-none"
          >
            <option value="Newest">Sort by: Newest</option>
            <option value="Price: Low to High">Price: Low to High</option>
            <option value="Price: High to Low">Price: High to Low</option>
          </select>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center text-gray-500 bg-[#F9F9F9] rounded-2xl border border-gray-100 p-8 text-center gap-3">
            <Filter size={32} className="opacity-20" />
            <h3 className="text-lg font-bold text-loomra-black">No products found</h3>
            <p className="text-sm text-loomra-muted">We couldn't find anything matching your current filters.</p>
            <button 
              onClick={() => {
                setSelectedSubcategory('All');
                setMinPrice('');
                setMaxPrice('');
              }} 
              className="mt-2 bg-white border border-loomra-black text-loomra-black px-6 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-loomra-black hover:text-white transition shadow-sm"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-6 md:gap-x-6 md:gap-y-8">
            {filteredProducts.map(product => (
              <MotionProductCard key={product._id} product={product} aspectRatio={aspectRatio} />
            ))}
          </div>
        )}
      </div>

      {/* Mobile Filter Drawer / Bottom Sheet */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm md:hidden"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
              className="fixed inset-x-0 bottom-0 z-[130] bg-white rounded-t-[30px] p-6 max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col gap-6 md:hidden pb-safe"
            >
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-loomra-black">Filters</h3>
                <button 
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close filters"
                >
                  <X size={18} className="text-loomra-black" />
                </button>
              </div>

              {/* Subcategories */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase tracking-[2px] text-gray-400">Subcategories</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedSubcategory('All')}
                    className={`px-4 py-2 border text-xs font-bold uppercase tracking-widest transition-all rounded-lg ${
                      selectedSubcategory === 'All' 
                        ? 'bg-loomra-black text-white border-loomra-black shadow-md' 
                        : 'bg-white text-loomra-muted border-loomra-surface hover:border-loomra-black'
                    }`}
                  >
                    All ({products.length})
                  </button>
                  {displaySubcategories.map((subcat) => (
                    <button
                      key={subcat.name}
                      onClick={() => setSelectedSubcategory(subcat.name)}
                      className={`px-4 py-2 border text-xs font-bold uppercase tracking-widest transition-all rounded-lg ${
                        selectedSubcategory === subcat.name 
                          ? 'bg-loomra-black text-white border-loomra-black shadow-md' 
                          : 'bg-white text-loomra-muted border-loomra-surface hover:border-loomra-black'
                      }`}
                    >
                      {subcat.name} ({subcat.count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase tracking-[2px] text-gray-400">Price Range (৳)</span>
                <div className="flex gap-3 items-center">
                  <input 
                    type="number" 
                    placeholder="Min" 
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full border border-loomra-surface p-3 text-sm bg-loomra-surface/50 rounded-xl outline-none focus:border-loomra-black transition-colors"
                  />
                  <span className="text-gray-400">-</span>
                  <input 
                    type="number" 
                    placeholder="Max" 
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full border border-loomra-surface p-3 text-sm bg-loomra-surface/50 rounded-xl outline-none focus:border-loomra-black transition-colors"
                  />
                </div>
              </div>

              {/* Sort By Option List in Drawer */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase tracking-[2px] text-gray-400">Sort By</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'Newest', label: 'Newest' },
                    { value: 'Price: Low to High', label: 'Low → High' },
                    { value: 'Price: High to Low', label: 'High → Low' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`py-3 px-2 border text-[10px] font-bold uppercase tracking-wider transition-all rounded-lg text-center ${
                        sortBy === option.value 
                          ? 'bg-loomra-black text-white border-loomra-black shadow-md' 
                          : 'bg-white text-loomra-muted border-loomra-surface hover:border-loomra-black'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 border-t border-gray-100 pt-6 mt-4">
                <button
                  onClick={() => {
                    setSelectedSubcategory('All');
                    setMinPrice('');
                    setMaxPrice('');
                    setSortBy('Newest');
                  }}
                  className="flex-1 border border-gray-200 text-loomra-black py-4 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 bg-[#A31F24] text-white py-4 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-800 active:scale-[0.98] transition-all shadow-lg"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
