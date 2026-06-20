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
            <img src={settings.logo} alt="AS SIDRAT" className="h-10 md:h-14 w-auto object-contain" />
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
                <Button href="/login?register=true">Sign Up</Button>
              </div>
            )
          )}

          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-loomra-surface text-loomra-black md:hidden focus:outline-none z-50"
            onClick={() => setOpen(state => !state)}
            aria-label="Toggle Menu"
          >
            <div className="relative w-5 h-5 flex items-center justify-center">
              <span className={`absolute h-[2px] w-5 bg-loomra-black rounded-lg transition-all duration-300 ${open ? 'rotate-45' : '-translate-y-1.5'}`} />
              <span className={`absolute h-[2px] w-5 bg-loomra-black rounded-lg transition-all duration-300 ${open ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`absolute h-[2px] w-5 bg-loomra-black rounded-lg transition-all duration-300 ${open ? '-rotate-45' : 'translate-y-1.5'}`} />
            </div>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop with Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
            />
            
            {/* Right Side Slide-out Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-[280px] bg-loomra-white p-6 shadow-2xl md:hidden flex flex-col justify-between"
            >
              <div className="flex flex-col gap-8">
                {/* Drawer Header */}
                <div className="flex justify-between items-center border-b border-loomra-surface pb-4">
                  <span className="text-xs font-black uppercase tracking-widest text-loomra-muted">Navigation</span>
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-loomra-surface text-loomra-black text-xs font-black hover:border-loomra-red hover:text-loomra-red transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    ✕
                  </button>
                </div>
                
                {/* Menu Links */}
                <nav className="flex flex-col gap-5">
                  {menu.map(item => (
                    <Link 
                      key={item.href} 
                      href={item.href} 
                      onClick={() => setOpen(false)} 
                      className="text-sm font-black uppercase tracking-widest text-loomra-black hover:text-loomra-red transition-colors flex items-center justify-between group"
                    >
                      <span>{item.label}</span>
                      <span className="text-gray-300 group-hover:text-loomra-red transition-transform group-hover:translate-x-1 duration-300">→</span>
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Drawer Bottom Actions */}
              <div className="border-t border-loomra-surface pt-6 space-y-4">
                {isAuthenticated ? (
                  <>
                    <Link 
                      href="/profile" 
                      onClick={() => setOpen(false)} 
                      className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-loomra-black hover:text-loomra-red transition-colors"
                    >
                      <User size={18} />
                      Profile Details
                    </Link>
                    <button 
                      onClick={() => { handleLogout(); setOpen(false); }} 
                      className="w-full text-center bg-loomra-black text-white py-3.5 text-xs font-black uppercase tracking-widest hover:bg-loomra-red transition-colors rounded-lg shadow-md"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    <Link 
                      href="/login" 
                      onClick={() => setOpen(false)} 
                      className="w-full text-center border border-loomra-black py-3 text-xs font-black uppercase tracking-widest text-loomra-black hover:bg-loomra-surface transition-colors rounded-lg"
                    >
                      Login
                    </Link>
                    <Link 
                      href="/login?register=true" 
                      onClick={() => setOpen(false)} 
                      className="w-full text-center bg-loomra-black text-white py-3 text-xs font-black uppercase tracking-widest hover:bg-loomra-red transition-colors rounded-lg"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
    </>
  );
}
