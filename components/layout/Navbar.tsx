"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ShoppingBag, User } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const menu = [
  { label: 'Men', href: '/category/men' },
  { label: 'Women', href: '/category/women' },
  { label: 'Fusion', href: '/category/fusion' },
  { label: 'Accessories', href: '/category/accessories' }
];

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const { toggleCart, cart } = useCartStore();
  const { isAuthenticated, logout, checkAuth } = useAuthStore();

  const { settings, fetchSettings } = useSettingsStore();

  useEffect(() => {
    setMounted(true);
    checkAuth();
    if (!settings) {
      fetchSettings();
    }
  }, [settings, fetchSettings, checkAuth]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    logout();
  };

  return (
    <>
      {settings?.announcementText && (
        <div 
          style={{ backgroundColor: settings.announcementBgColor || '#A31F24' }} 
          className="w-full text-white text-center py-2 px-4 text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-colors shadow-sm flex items-center justify-center"
        >
          {settings.announcementLink ? (
            <Link href={settings.announcementLink} className="hover:underline flex items-center justify-center gap-1">
              <span>{settings.announcementText}</span>
              <span className="text-[9px] transform translate-y-[0.5px]">→</span>
            </Link>
          ) : (
            <span>{settings.announcementText}</span>
          )}
        </div>
      )}
      <header className="border-b border-loomra-surface bg-loomra-white/95 backdrop-blur-lg sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center">
          {settings?.logo ? (
            <img src={settings.logo} alt="AS SIDRAT" className="h-8 w-auto object-contain" />
          ) : (
            <span className="text-xl font-bold tracking-tight text-loomra-black">AS SIDRAT</span>
          )}
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

          {mounted && (
            isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link href="/profile" className="flex items-center justify-center w-10 h-10 border border-loomra-surface rounded-full hover:border-loomra-red transition">
                  <User size={20} />
                </Link>
                <button onClick={handleLogout} className="hidden md:block px-4 py-2 border border-loomra-black bg-transparent text-loomra-black hover:bg-loomra-surface transition-colors rounded-[4px] text-small font-bold uppercase tracking-widest">
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button href="/login" variant="secondary">Login</Button>
                <Button href="/login">Sign Up</Button>
              </div>
            )
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

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="border-t border-loomra-surface bg-loomra-surface px-6 py-5 md:hidden overflow-hidden"
          >
            <div className="space-y-4">
              {menu.map(item => (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  onClick={() => setOpen(false)} 
                  className="block text-sm font-bold uppercase tracking-widest text-loomra-black hover:text-loomra-red transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-200/50 space-y-4">
                {isAuthenticated ? (
                  <>
                    <Link 
                      href="/profile" 
                      onClick={() => setOpen(false)} 
                      className="block text-sm font-bold uppercase tracking-widest text-loomra-black hover:text-loomra-red transition-colors"
                    >
                      Profile
                    </Link>
                    <button 
                      onClick={() => { handleLogout(); setOpen(false); }} 
                      className="block text-sm font-bold uppercase tracking-widest text-loomra-black hover:text-loomra-red transition-colors text-left w-full"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/login" 
                      onClick={() => setOpen(false)} 
                      className="block text-sm font-bold uppercase tracking-widest text-loomra-black hover:text-loomra-red transition-colors"
                    >
                      Login / Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
    </>
  );
}
