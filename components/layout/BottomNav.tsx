'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingBag, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore } from '@/store/useCartStore';

export default function BottomNav() {
  const pathname = usePathname();
  const cartItems = useCartStore((state) => state.cart);

  if (pathname === '/checkout') return null;

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Discover', path: '/category/men', icon: Search },
    { name: 'Cart', path: '/checkout', icon: ShoppingBag, badge: cartItems.length },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-loomra-white/90 backdrop-blur-md border-t border-loomra-surface z-50 pb-safe">
      <nav className="flex justify-between items-center px-24px h-[64px]">
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.path}
              className="relative flex flex-col items-center justify-center w-full h-full gap-4px"
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute top-1 w-1 h-1 bg-loomra-red rounded-full"
                />
              )}
              <div className="relative">
                <Icon
                  size={24}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  className={isActive ? 'text-loomra-black' : 'text-loomra-muted'}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-loomra-red text-loomra-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] uppercase tracking-widest ${isActive ? 'text-loomra-black font-bold' : 'text-loomra-muted font-medium'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
