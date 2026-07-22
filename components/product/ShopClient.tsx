'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/product/ProductCard';
import { Loader2, SlidersHorizontal, X } from 'lucide-react';
import { useLockedBody } from '@/lib/useLockedBody';

const SUB_CATEGORIES_MAP: Record<string, Array<{ name: string; slug: string }>> = {
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

export default function ShopClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const selectedCategory = searchParams.get('cat') || 'All';
  const selectedSubCategory = searchParams.get('sub') || 'all';

  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [selectedSize, setSelectedSize] = useState('All');

  const mainCategories = ['All', 'Men', 'Women', 'Fusion', 'Accessories'];
  const sizes = ['All', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        
        if (data.success) {
          setProducts(data.products);
          
          if (data.products.length > 0) {
            const highestPrice = Math.max(...data.products.map((p: any) => p.basePrice));
            setMaxPrice(highestPrice);
          }
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Update Main Category in URL
  const handleMainCategoryChange = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === 'All') {
      params.delete('cat');
      params.delete('sub');
    } else {
      params.set('cat', cat);
      params.delete('sub');
    }
    router.replace(`/shop?${params.toString()}`, { scroll: false });
  };

  // Update Sub-category in URL
  const handleSubCategoryChange = (subSlug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (subSlug === 'all') {
      params.delete('sub');
    } else {
      params.set('sub', subSlug);
    }
    router.replace(`/shop?${params.toString()}`, { scroll: false });
  };

  // Available subcategories for selected main category
  const activeSubCategories = useMemo(() => {
    if (selectedCategory === 'All') return [];
    const mainSlug = selectedCategory.toLowerCase();
    const defaults = SUB_CATEGORIES_MAP[mainSlug] || [];
    
    // Extract unique subcategories from products in this main category
    const extracted = new Set<string>();
    products.forEach((p) => {
      if (p.category?.toLowerCase() === mainSlug && p.subCategory) {
        extracted.add(p.subCategory.trim());
      }
    });

    const list = [...defaults];
    extracted.forEach((subName) => {
      const slug = subName.toLowerCase().replace(/\s+/g, '-');
      if (!list.some((item) => item.slug === slug)) {
        list.push({ name: subName, slug });
      }
    });
    return list;
  }, [selectedCategory, products]);

  // Filtering products
  const filteredProducts = useMemo(() => {
    let result = products;

    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (selectedSubCategory !== 'all') {
      const subSlug = selectedSubCategory.toLowerCase();
      result = result.filter(p => {
        const pSub = p.subCategory?.toLowerCase() || '';
        const pTags = p.tags?.map((t: string) => t.toLowerCase()) || [];
        const pTitle = p.title.toLowerCase();

        return (
          pSub === subSlug ||
          pSub.replace(/\s+/g, '-') === subSlug ||
          pTags.includes(subSlug) ||
          pTitle.includes(subSlug.replace('-', ' '))
        );
      });
    }

    result = result.filter(p => p.basePrice <= maxPrice);

    if (selectedSize !== 'All') {
      result = result.filter(p => 
        p.variants?.some((v: any) => v.size === selectedSize && v.stock > 0)
      );
    }

    return result;
  }, [selectedCategory, selectedSubCategory, maxPrice, selectedSize, products]);

  useLockedBody(isMobileFilterOpen);

  const clearFilters = () => {
    handleMainCategoryChange('All');
    setSelectedSize('All');
    if (products.length > 0) {
      const highestPrice = Math.max(...products.map(p => p.basePrice));
      setMaxPrice(highestPrice);
    }
  };

  const highestPrice = products.length > 0
    ? Math.max(...products.map((p) => p.basePrice))
    : 10000;

  return (
    <div className="container mx-auto px-4 py-8 lg:py-16">
      <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-widest text-[#1A1A1A]">
            {selectedCategory === 'All' ? 'Complete Collection' : `${selectedCategory} Collection`}
          </h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">Showing {filteredProducts.length} Products</p>
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

      {/* Mobile Filter Backdrop */}
      {isMobileFilterOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileFilterOpen(false)}
        />
      )}

      <div className="flex flex-col lg:flex-row gap-10">
        <div className={`fixed bottom-0 left-0 w-full bg-white rounded-t-3xl shadow-2xl z-50 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] transform transition-transform duration-500 ease-out lg:relative lg:translate-y-0 lg:w-64 lg:p-0 lg:bg-transparent lg:z-0 lg:block lg:shadow-none ${isMobileFilterOpen ? 'translate-y-0 max-h-[80vh] overflow-y-auto' : 'translate-y-full'}`}>
          {/* Drag Handle for Bottom Sheet */}
          <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-4 lg:hidden" />

          <div className="flex justify-between items-center lg:hidden mb-6 border-b pb-4">
            <h2 className="text-xl font-bold uppercase tracking-widest text-[#1A1A1A]">Filters</h2>
            <button onClick={() => setIsMobileFilterOpen(false)} className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 hover:text-black"><X size={24} /></button>
          </div>

          <div className="flex flex-col gap-8">
            {/* Main Category */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A] mb-3">Main Category</h3>
              <div className="flex flex-wrap gap-2">
                {mainCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => handleMainCategoryChange(cat)}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-full border transition-all ${
                      selectedCategory === cat
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900 active:scale-[0.97]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-categories (shows when a main category is selected) */}
            {activeSubCategories.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A] mb-3">
                  {selectedCategory} Sub-categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSubCategoryChange('all')}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-full border transition-all ${
                      selectedSubCategory === 'all'
                        ? 'bg-[#A31F24] text-white border-[#A31F24] shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400 active:scale-[0.97]'
                    }`}
                  >
                    All {selectedCategory}
                  </button>
                  {activeSubCategories.map((sub) => (
                    <button
                      key={sub.slug}
                      onClick={() => handleSubCategoryChange(sub.slug)}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-full border transition-all ${
                        selectedSubCategory === sub.slug
                          ? 'bg-[#A31F24] text-white border-[#A31F24] shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400 active:scale-[0.97]'
                      }`}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Max Price */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A] mb-4">Max Price: ৳ {maxPrice.toLocaleString()}</h3>
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

            {/* Size */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A] mb-4">Size</h3>
              <div className="flex flex-wrap gap-2">
                {sizes.map(s => (
                  <button 
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`w-10 h-10 flex items-center justify-center text-xs font-bold border rounded transition-colors ${selectedSize === s ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white' : 'border-gray-200 text-gray-600 hover:border-[#1A1A1A] active:bg-gray-50 active:scale-[0.95]'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={clearFilters}
              className="mt-4 text-xs font-bold uppercase tracking-widest text-red-600 hover:text-red-800 active:text-red-900 underline text-left"
            >
              Clear All Filters
            </button>

            <button 
              onClick={() => setIsMobileFilterOpen(false)}
              className="lg:hidden w-full bg-[#1A1A1A] text-white py-4 mt-6 text-sm font-bold uppercase tracking-widest rounded"
            >
              Show {filteredProducts.length} Results
            </button>
          </div>
        </div>

        <div className="flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-gray-500">
              <Loader2 size={40} className="animate-spin mb-4 text-[#A31F24]" />
              <p className="text-sm font-bold uppercase tracking-widest">Loading Collection...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="min-h-[40vh] flex flex-col items-center justify-center text-gray-500 bg-[#F9F9F9] rounded-lg border border-gray-100 p-8 text-center">
              <SlidersHorizontal size={48} className="opacity-20 mb-4" />
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">No products found</h3>
              <p className="text-sm mb-4">We couldn't find anything matching your current filters.</p>
              <button onClick={clearFilters} className="bg-white border border-[#1A1A1A] text-[#1A1A1A] px-6 py-2 text-sm font-bold uppercase tracking-widest rounded hover:bg-[#1A1A1A] hover:text-white active:scale-[0.97] transition">
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
