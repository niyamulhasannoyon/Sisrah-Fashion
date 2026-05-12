"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ShoppingBag, User } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';

const menu = [
  { label: 'Men', href: '/category/men' },
  { label: 'Women', href: '/category/women' },
  { label: 'Fusion', href: '/category/fusion' },
  { label: 'Accessories', href: '/category/accessories' }
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { toggleCart, cart } = useCartStore();
  const { isAuthenticated, logout } = useAuthStore();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    logout();
  };

  return (
    <header className="border-b border-loomra-surface bg-loomra-white/95 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8 lg:px-12">
        <Link href="/" className="text-xl font-semibold tracking-tight text-loomra-black">
          Loomra
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {menu.map(item => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-loomra-black hover:text-loomra-red">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button onClick={toggleCart} className="relative flex items-center justify-center w-10 h-10 border border-loomra-surface rounded-full hover:border-loomra-red transition">
            <ShoppingBag size={20} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-loomra-red text-loomra-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link href="/profile" className="flex items-center justify-center w-10 h-10 border border-loomra-surface rounded-full hover:border-loomra-red transition">
                <User size={20} />
              </Link>
              <button onClick={handleLogout} className="px-4 py-2 border border-loomra-black bg-transparent text-loomra-black hover:bg-loomra-surface transition-colors rounded-[4px] text-small font-bold uppercase tracking-widest">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button href="/login" variant="secondary">Login</Button>
              <Button href="/login">Sign Up</Button>
            </div>
          )}

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-loomra-surface text-loomra-black md:hidden"
            onClick={() => setOpen(state => !state)}
          >
            ☰
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-loomra-surface bg-loomra-surface px-6 py-4 md:hidden">
          <div className="space-y-3">
            {menu.map(item => (
              <Link key={item.href} href={item.href} className="block text-base font-medium text-loomra-black hover:text-loomra-red">
                {item.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-loomra-surface">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <Link href="/profile" className="block text-base font-medium text-loomra-black hover:text-loomra-red">
                    Profile
                  </Link>
                  <button onClick={handleLogout} className="block text-base font-medium text-loomra-black hover:text-loomra-red">
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link href="/login" className="block text-base font-medium text-loomra-black hover:text-loomra-red">
                    Login
                  </Link>
                  <Link href="/login" className="block text-base font-medium text-loomra-black hover:text-loomra-red">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
