"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ShoppingBag, User } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useEffect } from 'react';
import { useLockedBody } from '@/lib/useLockedBody';
import { motion, AnimatePresence } from 'framer-motion';
import { getDirectImageLink } from '@/lib/utils';

const menu = [
  { label: 'Men', href: '/category/men' },
  { label: 'Women', href: '/category/women' },
  { label: 'Fusion', href: '/category/fusion' },
  { label: 'Accessories', href: '/category/accessories' }
];

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(false);
  const { toggleCart, cart } = useCartStore();
  const { isAuthenticated, logout, checkAuth, user } = useAuthStore();
  const pathname = usePathname();

  const { settings, fetchSettings } = useSettingsStore();

  useEffect(() => {
    setMounted(true);
    // Wait for Zustand to rehydrate from localStorage
    const unsubscribe = useCartStore.persist.onFinishHydration(() => setHydrated(true));
    if (useCartStore.persist.hasHydrated()) setHydrated(true);
    checkAuth();
    if (!settings) {
      fetchSettings();
    }
    return () => unsubscribe();
  }, [settings, fetchSettings, checkAuth]);

  useLockedBody(open);

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
      <header className="sticky top-0 z-[100] w-full border-b border-white/20 bg-white/80 backdrop-blur-lg shadow-sm transition-all duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 md:py-3 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          {/* Brand Logo Icon Container */}
          <div className="relative w-8 h-8 md:w-10 md:h-10 shrink-0 flex items-center justify-center overflow-hidden">
            {!mounted ? (
              // Faint skeleton circle that doesn't cause shift
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 animate-pulse" />
            ) : settings?.logo ? (
              <Image 
                src={getDirectImageLink(settings.logo)} 
                alt="AS SIDRAT" 
                fill
                sizes="(max-width: 768px) 32px, 40px"
                priority
                className="object-contain transition-all duration-300 group-hover:scale-105" 
              />
            ) : (
              // Fallback letter placeholder
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-bold text-slate-400 select-none">
                S
              </div>
            )}
          </div>
          
          {/* Brand Name Text */}
          <span className="text-sm md:text-base font-bold tracking-[0.25em] text-[#1A1A1A] uppercase select-none transition-all duration-300 group-hover:text-[#A31F24]">
            AS SIDRAT
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {menu.map(item => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-loomra-black hover:text-loomra-red active:text-[#A31F24] transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link 
            href="/track-order" 
            className="hidden sm:flex items-center gap-2.5 px-4 h-12 border border-loomra-surface hover:border-loomra-red active:bg-loomra-surface rounded-full text-xs font-bold uppercase tracking-widest text-[#1A1A1A] hover:text-[#A31F24] transition-all"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Track Order
          </Link>

          <button onClick={toggleCart} aria-label="Open Cart" className="relative hidden md:flex items-center justify-center w-12 h-12 border border-white/30 bg-white/50 hover:bg-white/80 active:bg-loomra-surface rounded-full hover:border-loomra-red transition-all duration-300">
            <ShoppingBag size={20} />
            {hydrated && cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-loomra-red text-loomra-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                {cart.length}
              </span>
            )}
          </button>

          {/* Auth Section with reserved layout space & fade-in transition */}
          <div className="hidden md:flex items-center gap-2">
            {!mounted ? (
              // Initial Mounting Skeleton to prevent CLS & Mismatches
              <div className="flex items-center gap-2">
                <div className="h-9 w-20 bg-slate-100 rounded-lg animate-pulse" />
                <div className="h-9 w-24 bg-slate-100 rounded-lg animate-pulse" />
              </div>
            ) : (
              <div className="flex items-center gap-2 transition-opacity duration-300 opacity-100">
                {isAuthenticated ? (
                  <>
                    <Link href="/profile" aria-label="View Profile" className="flex items-center justify-center w-9 h-9 border border-loomra-surface rounded-full hover:border-loomra-red transition overflow-hidden shadow-sm">
                      {user?.image ? (
                        <img src={user.image} alt={user.name} width="36" height="36" className="w-full h-full object-cover" />
                      ) : (
                        <User size={16} />
                      )}
                    </Link>
                    <button onClick={handleLogout} className="px-4 py-2 border border-loomra-black bg-transparent text-loomra-black hover:bg-loomra-surface transition-colors rounded-[4px] text-small font-bold uppercase tracking-widest">
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Button href="/login" variant="secondary" className="py-2 px-4 text-xs h-9 w-20">Login</Button>
                    <Button href="/login?register=true" className="py-2 px-4 text-xs h-9 w-24">Sign Up</Button>
                  </>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            className="relative flex h-12 w-12 items-center justify-center rounded-full border border-loomra-surface text-loomra-black md:hidden focus:outline-none z-50"
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
    </header>

    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop with Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[105] bg-slate-950/60 backdrop-blur-lg md:hidden"
          />
          {/* Right Side Slide-out Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            style={{ backgroundColor: '#FFFFFF' }}
            className="fixed inset-y-0 right-0 z-[110] w-full bg-white p-6 shadow-2xl md:hidden flex flex-col justify-between border-l border-slate-100 overflow-y-auto"
          >
            <div className="flex flex-col gap-8">
              {/* Drawer Header */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                {settings?.logo ? (
                  <img src={getDirectImageLink(settings.logo)} alt="AS SIDRAT" width="120" height="32" className="h-8 w-auto object-contain" />
                ) : (
                  <span className="text-sm font-black tracking-widest text-slate-800 uppercase">AS SIDRAT</span>
                )}
                <button
                  type="button"
                  aria-label="Close menu"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 text-slate-800 hover:border-black hover:text-black transition-colors text-xs font-bold"
                  onClick={() => setOpen(false)}
                >
                  ✕
                </button>
              </div>
              
              {/* Menu Links */}
              <nav className="flex flex-col gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[3px] text-slate-500 mb-2 block ml-4">Collections</span>
                {menu.map(item => {
                  const isActive = pathname === item.href;
                  return (
                    <Link 
                      key={item.href} 
                      href={item.href} 
                      onClick={() => setOpen(false)} 
                      className={`flex items-center justify-between px-4 py-4 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-200 group ${
                        isActive 
                          ? 'text-[#A31F24] bg-slate-50' 
                          : 'text-slate-900 hover:text-[#A31F24] hover:bg-slate-50 active:bg-slate-100 active:scale-[0.98]'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className={`transition-transform duration-300 ${
                        isActive 
                          ? 'text-[#A31F24] translate-x-1.5' 
                          : 'text-slate-300 group-hover:text-[#A31F24] group-hover:translate-x-1.5'
                      }`}>→</span>
                    </Link>
                  );
                })}
                <div className="border-t border-slate-100/80 my-2 pt-2">
                  <Link 
                    href="/track-order" 
                    onClick={() => setOpen(false)} 
                    className="flex items-center justify-between px-4 py-4 rounded-xl text-sm font-bold uppercase tracking-wider text-slate-900 bg-slate-50 hover:text-[#A31F24] hover:bg-slate-100 transition-all duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span>Track Order</span>
                    </div>
                    <span className="text-slate-400">→</span>
                  </Link>
                </div>
              </nav>
            </div>

            {/* Drawer Bottom Actions */}
            <div className="border-t border-slate-100 pt-6 mt-auto">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <Link 
                    href="/profile" 
                    onClick={() => setOpen(false)} 
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-[0.15em] text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    {user?.image ? (
                      <img src={user.image} alt={user.name} width="24" height="24" className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-100 shadow-sm" />
                    ) : (
                      <User size={16} className="text-slate-400" />
                    )}
                    <span>My Profile</span>
                  </Link>
                  <button 
                    onClick={() => { handleLogout(); setOpen(false); }} 
                    className="w-full text-center bg-black text-white py-4 text-xs font-black uppercase tracking-widest hover:bg-[#A31F24] active:scale-[0.98] transition-all rounded-xl shadow-md"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-[3px] text-slate-500 mb-1 block ml-4">Account</span>
                  <div className="grid grid-cols-2 gap-3">
                    <Link 
                      href="/login" 
                      onClick={() => setOpen(false)} 
                      className="text-center border border-slate-200 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-slate-800 hover:bg-slate-50 hover:border-slate-850 transition-all duration-300 rounded-xl"
                    >
                      Login
                    </Link>
                    <Link 
                      href="/login?register=true" 
                      onClick={() => setOpen(false)} 
                      className="text-center bg-[#1A1A1A] text-white py-3.5 text-xs font-black uppercase tracking-[0.15em] hover:bg-[#A31F24] transition-all duration-300 rounded-xl shadow-sm"
                    >
                      Sign Up
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
}
