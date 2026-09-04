'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight } from 'lucide-react';

export default function NotFoundSearch() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/shop?search=${encodeURIComponent(trimmed)}`);
    } else {
      router.push('/shop');
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="relative max-w-md mx-auto w-full group"
    >
      <div className="relative flex items-center">
        <Search
          size={18}
          className="absolute left-4 text-gray-400 group-focus-within:text-[#A31F24] transition-colors pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products, shirts, t-shirts..."
          className="w-full pl-11 pr-24 py-3.5 bg-white border border-gray-200 rounded-full text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#A31F24] focus:ring-2 focus:ring-[#A31F24]/10 shadow-sm transition-all"
        />
        <button
          type="submit"
          className="absolute right-1.5 px-4 py-2 bg-[#A31F24] hover:bg-[#8B1A1E] text-white text-xs font-semibold rounded-full flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
        >
          <span>Search</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </form>
  );
}
