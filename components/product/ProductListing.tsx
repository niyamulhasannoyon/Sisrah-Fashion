'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { useLockedBody } from '@/lib/useLockedBody';

interface ProductItem {
  _id: string;
  title: string;
  slug: string;
  category: string;
  subCategory?: string;
  basePrice: number;
  discountPrice?: number;
  offerPrice?: number;
  images?: { url: string }[];
  tags?: string[];
  variants?: Array<{ size: string; stock: number }>;
  rating?: number;
  numReviews?: number;
}

interface ProductListingProps {
  products: ProductItem[];
  categoryName?: string;
  aspectRatio?: 'portrait' | 'square';
}

const DEFAULT_SUB_CATEGORIES: Record<string, Array<{ name: string; slug: string }>> = {
  men: [
    { name: 'Shirts', slug: 'shirts' },
    { name: 'Panjabi', slug: 'panjabi' },
    { name: 'T-Shirts', slug: 't-shirts' },
    { name: 'Polo', slug: 'polo' },
    { name: 'Trousers', slug: 'trousers' },
    { name: 'Co-ords', slug: 'co-ords' },
  ],
  women: [
    { name: 'Kurtis', slug: 'kurtis' },
    { name: 'Shirts', slug: 'shirts' },
    { name: 'Dresses', slug: 'dresses' },
    { name: 'Co-ords', slug: 'co-ords' },
    { name: 'Trousers', slug: 'trousers' },
  ],
  fusion: [
    { name: 'Kurtas', slug: 'kurtas' },
    { name: 'Panjabi', slug: 'panjabi' },
    { name: 'Co-ords', slug: 'co-ords' },
    { name: 'Linen Sets', slug: 'linen-sets' },
  ],
  accessories: [
    { name: 'Bags', slug: 'bags' },
    { name: 'Leather Goods', slug: 'leather' },
    { name: 'Essentials', slug: 'essentials' },
  ],
};

export default function ProductListing({
  products,
  categoryName,
}: ProductListingProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Active Main Category Context (e.g. 'Men', 'Women', 'Fusion', 'Accessories')
  const activeMainCategory = categoryName || products[0]?.category || 'Shop';
  const mainCategorySlug = activeMainCategory.toLowerCase();

  // Read active sub-category from URL query: e.g. /category/men?sub=panjabi
  const activeSubCategorySlug = searchParams.get('sub') || 'all';

  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [selectedSize, setSelectedSize] = useState('All');

  const sizes = ['All', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];

  // Auto-set max price from available products
  useEffect(() => {
    if (products.length > 0) {
      const highest = Math.max(...products.map((p) => p.basePrice));
      setMaxPrice(highest);
    }
  }, [products]);

  // Derive dynamic sub-categories for active main category
  const dynamicSubCategories = useMemo(() => {
    const defaults = DEFAULT_SUB_CATEGORIES[mainCategorySlug] || [];
    
    // Extract unique subCategories or tags from actual products in this category
    const extractedFromProducts = new Set<string>();
    products.forEach((p) => {
      if (p.subCategory && p.subCategory.trim()) {
        extractedFromProducts.add(p.subCategory.trim());
      }
    });

    const list: Array<{ name: string; slug: string }> = [...defaults];

    // Add any unique product subcategory not in defaults
    extractedFromProducts.forEach((subName) => {
      const slug = subName.toLowerCase().replace(/\s+/g, '-');
      if (!list.some((item) => item.slug === slug)) {
        list.push({ name: subName, slug });
      }
    });

    return list;
  }, [mainCategorySlug, products]);

  // Handle Sub-category Change (Updates URL params naturally)
  const handleSubCategoryChange = (subSlug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (subSlug === 'all') {
      params.delete('sub');
    } else {
      params.set('sub', subSlug);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // ── Filtering logic ──
  const filteredProducts = useMemo(() => {
    let result = products;

    // Filter by Sub-category if specific sub-category selected
    if (activeSubCategorySlug !== 'all') {
      result = result.filter((p) => {
        const subSlug = activeSubCategorySlug.toLowerCase();
        const pSub = p.subCategory?.toLowerCase() || '';
        const pTags = p.tags?.map((t) => t.toLowerCase()) || [];
        const pTitle = p.title.toLowerCase();

        return (
          pSub === subSlug ||
          pSub.replace(/\s+/g, '-') === subSlug ||
          pTags.includes(subSlug) ||
          pTitle.includes(subSlug.replace('-', ' '))
        );
      });
    }

    // Filter by Max Price
    result = result.filter((p) => p.basePrice <= maxPrice);

    // Filter by Size
    if (selectedSize !== 'All') {
      result = result.filter((p) =>
        p.variants?.some((v) => v.size === selectedSize && v.stock > 0)
      );
    }

    return result;
  }, [products, activeSubCategorySlug, maxPrice, selectedSize]);

  useLockedBody(isMobileFilterOpen);

  const clearFilters = () => {
    handleSubCategoryChange('all');
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
            {activeMainCategory}
          </h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            Showing {filteredProducts.length} Products
          </p>
        </div>
      </div>

      {/* Mobile Floating Filters Button */}
      <button
        onClick={() => setIsMobileFilterOpen(true)}
        className="lg:hidden fixed bottom-20 right-2 z-40 flex items-center justify-center w-12 h-12 rounded-full bg-white text-[#1A1A1A] border border-gray-200 shadow-lg active:scale-95 transition-transform"
        aria-label="Filters"
      >
        <SlidersHorizontal size={20} />
      </button>

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
            <button onClick={() => setIsMobileFilterOpen(false)} className="min-w-[44px] min-h-[44px] flex items-center justify-center">
              <X size={24} />
            </button>
          </div>

          <div className="flex flex-col gap-8">
            {/* ── Dynamic Sub-category Filter Group ── */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A] mb-3">
                {activeMainCategory} Categories
              </h3>
              
              <div className="flex flex-wrap gap-2">
                {/* All Products in Main Category */}
                <button
                  onClick={() => handleSubCategoryChange('all')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    activeSubCategorySlug === 'all'
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-100 active:scale-[0.97]'
                  }`}
                >
                  All {activeMainCategory}
                </button>

                {/* Sub-categories */}
                {dynamicSubCategories.map((sub) => {
                  const isSelected = activeSubCategorySlug === sub.slug;
                  return (
                    <button
                      key={sub.slug}
                      onClick={() => handleSubCategoryChange(sub.slug)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                        isSelected
                          ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-100 active:scale-[0.97]'
                      }`}
                    >
                      {sub.name}
                    </button>
                  );
                })}
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
                        : 'border-gray-200 text-gray-600 hover:border-[#1A1A1A] active:bg-gray-50 active:scale-[0.95]'
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
              className="mt-4 text-xs font-bold uppercase tracking-widest text-red-600 hover:text-red-800 active:text-red-900 underline text-left"
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
