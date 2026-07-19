'use client';

import { useState, useEffect, useMemo } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';

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
    variants?: Array<{ size: string; stock: number }>;
    rating?: number;
    numReviews?: number;
  }>;
  categoryName?: string;
  aspectRatio?: 'portrait' | 'square';
}

export default function ProductListing({
  products,
  categoryName,
}: ProductListingProps) {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // ── Filters (matching ShopClient UI exactly) ──
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [selectedSize, setSelectedSize] = useState('All');

  const categories = ['All', 'Men', 'Women', 'Kids', 'Accessories'];
  const sizes = ['All', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];

  // Auto-set max price from available products
  useEffect(() => {
    if (products.length > 0) {
      const highest = Math.max(...products.map((p) => p.basePrice));
      setMaxPrice(highest);
    }
  }, [products]);

  const activeCategory = categoryName || products[0]?.category || 'Shop';

  // ── Filtering logic (same structure as ShopClient) ──
  const filteredProducts = useMemo(() => {
    let result = products;

    if (selectedCategory !== 'All') {
      result = result.filter((p) =>
        p.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    result = result.filter((p) => p.basePrice <= maxPrice);

    if (selectedSize !== 'All') {
      result = result.filter((p) =>
        p.variants?.some((v) => v.size === selectedSize && v.stock > 0)
      );
    }

    return result;
  }, [products, selectedCategory, maxPrice, selectedSize]);

  const clearFilters = () => {
    setSelectedCategory('All');
    setSelectedSize('All');
    if (products.length > 0) {
      setMaxPrice(Math.max(...products.map((p) => p.basePrice)));
    }
  };

  const highestPrice = products.length > 0
    ? Math.max(...products.map((p) => p.basePrice))
    : 10000;

  return (
    <div className="container mx-auto px-4 py-8 lg:py-16">
      {/* ── Header ── */}
      <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-widest text-[#1A1A1A]">
            {activeCategory}
          </h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            Showing {filteredProducts.length} Products
          </p>
        </div>
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="lg:hidden flex items-center gap-2 bg-[#F9F9F9] border border-gray-200 px-4 py-2 rounded text-sm font-bold uppercase"
        >
          <SlidersHorizontal size={16} /> Filters
        </button>
      </div>

      {/* ── Main Layout: Sidebar + Grid ── */}
      <div className="flex flex-col lg:flex-row gap-10">
        {/* ── Desktop / Mobile Slide-Out Sidebar ── */}
        <div
          className={`fixed inset-0 z-50 bg-white p-6 transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:w-64 lg:p-0 lg:bg-transparent lg:z-0 lg:block ${
            isMobileFilterOpen
              ? 'translate-x-0 overflow-y-auto'
              : '-translate-x-full'
          }`}
        >
          <div className="flex justify-between items-center lg:hidden mb-6 border-b pb-4">
            <h2 className="text-xl font-bold uppercase tracking-widest">
              Filters
            </h2>
            <button onClick={() => setIsMobileFilterOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <div className="flex flex-col gap-8">
            {/* ── Category Radio Buttons ── */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A] mb-4">
                Category
              </h3>
              <div className="flex flex-col gap-3">
                {categories.map((cat) => (
                  <label
                    key={cat}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === cat}
                      onChange={() => setSelectedCategory(cat)}
                      className="w-4 h-4 accent-[#1A1A1A]"
                    />
                    <span
                      className={`text-sm ${
                        selectedCategory === cat
                          ? 'font-bold text-[#1A1A1A]'
                          : 'text-gray-500 group-hover:text-[#1A1A1A]'
                      }`}
                    >
                      {cat}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* ── Price Range Slider ── */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A] mb-4">
                Max Price: ৳ {maxPrice.toLocaleString()}
              </h3>
              <input
                type="range"
                min="0"
                max={highestPrice}
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#1A1A1A] h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2 font-bold">
                <span>৳ 0</span>
                <span>৳ {highestPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* ── Size Selector Buttons ── */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A] mb-4">
                Size
              </h3>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`w-10 h-10 flex items-center justify-center text-xs font-bold border rounded transition-colors ${
                      selectedSize === s
                        ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white'
                        : 'border-gray-200 text-gray-600 hover:border-[#1A1A1A]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Clear Filters ── */}
            <button
              onClick={clearFilters}
              className="mt-4 text-xs font-bold uppercase tracking-widest text-red-600 hover:text-red-800 underline text-left"
            >
              Clear All Filters
            </button>

            {/* ── Mobile Apply Button ── */}
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="lg:hidden w-full bg-[#1A1A1A] text-white py-4 mt-6 text-sm font-bold uppercase tracking-widest rounded"
            >
              Show {filteredProducts.length} Results
            </button>
          </div>
        </div>

        {/* ── Product Grid ── */}
        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="min-h-[40vh] flex flex-col items-center justify-center text-gray-500 bg-[#F9F9F9] rounded-lg border border-gray-100 p-8 text-center">
              <SlidersHorizontal size={48} className="opacity-20 mb-4" />
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">
                No products found
              </h3>
              <p className="text-sm mb-4">
                We couldn&apos;t find anything matching your current filters.
              </p>
              <button
                onClick={clearFilters}
                className="bg-white border border-[#1A1A1A] text-[#1A1A1A] px-6 py-2 text-sm font-bold uppercase tracking-widest rounded hover:bg-[#1A1A1A] hover:text-white transition"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-x-6 md:gap-y-10">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
