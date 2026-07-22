'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingBag, User, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect, useState, useMemo } from 'react';

export default function BottomNav() {
  const pathname = usePathname();
  const { cart: cartItems, toggleCart } = useCartStore();
  const { wishlist, toggleWishlistDrawer } = useWishlistStore();
  const { user } = useAuthStore();
  
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch products locally when search overlay is opened
  useEffect(() => {
    if (isSearchOpen && products.length === 0) {
      fetch('/api/products')
        .then(res => res.json())
        .then(data => {
          if (data.success) setProducts(data.products);
        })
        .catch(err => console.error("Search API fetch error:", err));
    }
  }, [isSearchOpen, products.length]);

  // Client-side search filtering
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return products.filter(p => 
      p.title.toLowerCase().includes(query) || 
      p.category.toLowerCase().includes(query) ||
      p.tags?.some((t: string) => t.toLowerCase().includes(query))
    ).slice(0, 5);
  }, [searchQuery, products]);

  if (pathname === '/checkout') return null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?q=${encodeURIComponent(searchQuery.trim())}`;
      setIsSearchOpen(false);
    }
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { 
      name: 'Search', 
      path: '#search', 
      icon: Search, 
      action: (e: any) => { 
        e.preventDefault(); 
        setIsSearchOpen(true); 
      } 
    },
    { name: 'Wishlist', path: '#wishlist', icon: Heart, badge: mounted ? wishlist.length : 0, action: (e: any) => { e.preventDefault(); toggleWishlistDrawer(); } },
    { name: 'Cart', path: '#cart', icon: ShoppingBag, badge: mounted ? cartItems.length : 0, action: (e: any) => { e.preventDefault(); toggleCart(); } },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-lg border-t border-white/20 z-50 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.05)]">
        <nav className="flex justify-between items-center px-4 h-[64px]">
          {navItems.map((item) => {
            const isActive = item.action 
              ? false 
              : pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={item.action}
                className="relative flex flex-col items-center justify-center w-full h-full gap-1"
              >
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute top-1 w-1 h-1 bg-loomra-red rounded-full"
                  />
                )}
                <div className="relative">
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    className={isActive ? 'text-loomra-black' : 'text-loomra-muted'}
                  />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-2 -right-2 bg-loomra-red text-loomra-white text-[9px] w-4.5 h-4.5 flex items-center justify-center rounded-full font-bold shadow-lg">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[9px] uppercase tracking-widest ${isActive ? 'text-loomra-black font-bold' : 'text-loomra-muted font-medium'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Slick Mobile Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed inset-0 z-[1000] bg-white p-6 pb-24 md:hidden flex flex-col gap-6"
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <h2 className="text-lg font-black uppercase tracking-widest text-[#1A1A1A]">Search Products</h2>
              <button 
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:text-black active:scale-90 transition-transform"
              >
                ✕
              </button>
            </div>

            {/* Input Wrapper */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search for shirts, panjabis, kaftans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black focus:bg-white transition-all font-semibold"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </form>

            {/* Quick/Popular Links (when search query is empty) */}
            {searchQuery.trim() === '' ? (
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Popular Searches</span>
                <div className="flex flex-wrap gap-2">
                  {['Linen Shirt', 'Panjabi', 'Kaftan', 'Cotton Pant'].map(term => (
                    <button
                      key={term}
                      onClick={() => {
                        setSearchQuery(term);
                        window.location.href = `/shop?q=${encodeURIComponent(term)}`;
                        setIsSearchOpen(false);
                      }}
                      className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 transition active:scale-95"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Dynamic Search Results dropdown list */
              <div className="flex-1 overflow-y-auto flex flex-col gap-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Products Found ({searchResults.length})
                </span>
                
                {searchResults.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {searchResults.map((p: any) => (
                      <Link
                        key={p._id}
                        href={`/product/${p.slug}`}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl border border-transparent hover:border-gray-100 transition active:scale-[0.98]"
                      >
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-50 border border-gray-150">
                          <img 
                            src={p.images?.[0]?.url || '/images/placeholder.jpg'} 
                            alt={p.title} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-gray-900 truncate">{p.title}</span>
                          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{p.category}</span>
                        </div>
                        <span className="ml-auto text-xs font-black text-[#A31F24]">৳ {p.basePrice.toLocaleString()}</span>
                      </Link>
                    ))}
                    <button
                      onClick={handleSearchSubmit}
                      className="w-full text-center text-xs font-black uppercase tracking-widest text-[#A31F24] hover:underline py-3 bg-[#A31F24]/5 rounded-xl mt-2 border border-transparent hover:border-[#A31F24]/10 transition"
                    >
                      View All Results
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400 text-xs font-bold">
                    No products found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
