'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/product/ProductCard';
import { Loader2, SlidersHorizontal, X } from 'lucide-react';

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [selectedSize, setSelectedSize] = useState('All');

  const categories = ['All', 'Men', 'Women', 'Kids', 'Accessories'];
  const sizes = ['All', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        
        if (data.success) {
          setProducts(data.products);
          setFilteredProducts(data.products);
          
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

  useEffect(() => {
    let result = products;

    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    result = result.filter(p => p.basePrice <= maxPrice);

    if (selectedSize !== 'All') {
      result = result.filter(p => 
        p.variants?.some((v: any) => v.size === selectedSize && v.stock > 0)
      );
    }

    setFilteredProducts(result);
  }, [selectedCategory, maxPrice, selectedSize, products]);

  const clearFilters = () => {
    setSelectedCategory('All');
    setSelectedSize('All');
    if (products.length > 0) {
      const highestPrice = Math.max(...products.map(p => p.basePrice));
      setMaxPrice(highestPrice);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 lg:py-16">
      <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-widest text-[#1A1A1A]">Collection</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">Showing {filteredProducts.length} Products</p>
        </div>
        <button 
          onClick={() => setIsMobileFilterOpen(true)}
          className="lg:hidden flex items-center gap-2 bg-[#F9F9F9] border border-gray-200 px-4 py-2 rounded text-sm font-bold uppercase"
        >
          <SlidersHorizontal size={16} /> Filters
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        <div className={`fixed inset-0 z-50 bg-white p-6 transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:w-64 lg:p-0 lg:bg-transparent lg:z-0 lg:block ${isMobileFilterOpen ? 'translate-x-0 overflow-y-auto' : '-translate-x-full'}`}>
          <div className="flex justify-between items-center lg:hidden mb-6 border-b pb-4">
            <h2 className="text-xl font-bold uppercase tracking-widest">Filters</h2>
            <button onClick={() => setIsMobileFilterOpen(false)}><X size={24} /></button>
          </div>

          <div className="flex flex-col gap-8">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A] mb-4">Category</h3>
              <div className="flex flex-col gap-3">
                {categories.map(cat => (
                  <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="category" 
                      checked={selectedCategory === cat}
                      onChange={() => setSelectedCategory(cat)}
                      className="w-4 h-4 accent-[#1A1A1A]" 
                    />
                    <span className={`text-sm ${selectedCategory === cat ? 'font-bold text-[#1A1A1A]' : 'text-gray-500 group-hover:text-[#1A1A1A]'}`}>
                      {cat}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A] mb-4">Max Price: ৳ {maxPrice.toLocaleString()}</h3>
              <input 
                type="range" 
                min="0" 
                max={products.length > 0 ? Math.max(...products.map(p => p.basePrice)) : 10000} 
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#1A1A1A] h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2 font-bold">
                <span>৳ 0</span>
                <span>৳ {products.length > 0 ? Math.max(...products.map(p => p.basePrice)).toLocaleString() : '10K'}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A] mb-4">Size</h3>
              <div className="flex flex-wrap gap-2">
                {sizes.map(s => (
                  <button 
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`w-10 h-10 flex items-center justify-center text-xs font-bold border rounded transition-colors ${selectedSize === s ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white' : 'border-gray-200 text-gray-600 hover:border-[#1A1A1A]'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={clearFilters}
              className="mt-4 text-xs font-bold uppercase tracking-widest text-red-600 hover:text-red-800 underline text-left"
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
              <Loader2 size={40} className="animate-spin mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest">Loading Collection...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="min-h-[40vh] flex flex-col items-center justify-center text-gray-500 bg-[#F9F9F9] rounded-lg border border-gray-100 p-8 text-center">
              <SlidersHorizontal size={48} className="opacity-20 mb-4" />
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">No products found</h3>
              <p className="text-sm mb-4">We couldn't find anything matching your current filters.</p>
              <button onClick={clearFilters} className="bg-white border border-[#1A1A1A] text-[#1A1A1A] px-6 py-2 text-sm font-bold uppercase tracking-widest rounded hover:bg-[#1A1A1A] hover:text-white transition">
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
