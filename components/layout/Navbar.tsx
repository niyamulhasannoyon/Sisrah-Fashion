"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { ShoppingBag, User, Truck, LogOut, Package, ChevronDown } from 'lucide-react';
import { useWishlistStore } from '@/store/useWishlistStore';
import WishlistDrawer from '@/components/wishlist/WishlistDrawer';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useLockedBody } from '@/lib/useLockedBody';
import { motion, AnimatePresence } from 'framer-motion';
import { getDirectImageLink } from '@/lib/utils';
import type { NavItem } from '@/types';

const menu: NavItem[] = [
  { label: 'Men', href: '/category/men' },
  { label: 'Women', href: '/category/women' },
  { label: 'Fusion', href: '/category/fusion' },
  { label: 'Accessories', href: '/category/accessories' }
];

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { toggleCart, cart } = useCartStore();
  const { isAuthenticated, logout, checkAuth, user } = useAuthStore();
  const pathname = usePathname();
  const { settings, fetchSettings } = useSettingsStore();

  useEffect(() => {
    setMounted(true);
    const unsubscribe = useCartStore.persist.onFinishHydration(() => setHydrated(true));
    if (useCartStore.persist.hasHydrated()) setHydrated(true);
    checkAuth();
    if (!settings) {
      fetchSettings();
    }
    return () => unsubscribe();
  }, [settings, fetchSettings, checkAuth]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useLockedBody(open);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await fetch('/api/auth/logout', { method: 'POST' });
    logout();
  };

  return (
    <>
      {settings?.announcementText && (
        <div 
          style={{ backgroundColor: settings.announcementBgColor || '#A31F24' }} 
          className="w-full text-white text-center py-2.5 px-4 text-xs sm:text-sm font-semibold font-bengali leading-snug transition-colors shadow-subtle flex items-center justify-center"
        >
          {settings.announcementLink ? (
            <Link href={settings.announcementLink} className="hover:underline flex items-center justify-center gap-1.5 flex-wrap">
              <span>{settings.announcementText}</span>
              <span className="text-[10px] transform translate-y-[0.5px]">→</span>
            </Link>
          ) : (
            <span>{settings.announcementText}</span>
          )}
        </div>
      )}

      <header className="sticky top-0 z-[100] w-full border-b border-neutral-200/70 bg-white/90 backdrop-blur-md shadow-subtle transition-all duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-2 md:py-2.5">
          <div className="flex items-center gap-8 lg:gap-12">
            <Link href="/" className="flex items-center gap-3 shrink-0 group">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 shrink-0 flex items-center justify-center overflow-hidden">
                {!mounted ? (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-neutral-100 animate-pulse" />
                ) : settings?.logo ? (
                  <Image 
                    src={getDirectImageLink(settings.logo)} 
                    alt="AS SIDRAT" 
                    fill
                    sizes="(max-width: 768px) 48px, 56px"
                    priority
                    className="object-contain transition-all duration-300 group-hover:scale-105" 
                  />
                ) : (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-sm font-bold text-neutral-700 select-none">
                    S
                  </div>
                )}
              </div>
              
              <span className="text-base md:text-lg font-bold tracking-[0.2em] text-neutral-900 uppercase select-none transition-all duration-300 group-hover:text-brand">
                AS SIDRAT
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              {menu.map(item => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    className={`text-xs font-bold uppercase tracking-wider transition-colors py-1 ${
                      isActive ? 'text-brand border-b-2 border-brand' : 'text-neutral-700 hover:text-brand'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link 
              href="/track-order" 
              className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-200 text-xs font-semibold text-neutral-700 hover:text-brand hover:border-brand hover:bg-surface transition-all duration-200"
            >
              <Truck size={14} className="text-neutral-500" />
              <span>Track Order</span>
            </Link>

            <button 
              onClick={toggleCart} 
              aria-label="Open Cart" 
              className="relative flex items-center justify-center w-10 h-10 rounded-full border border-neutral-200 bg-surface/60 hover:bg-neutral-100 hover:border-neutral-300 text-neutral-800 transition-all duration-200"
            >
              <ShoppingBag size={18} />
              {hydrated && cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                  {cart.length}
                </span>
              )}
            </button>

            <div className="hidden md:block relative" ref={dropdownRef}>
              {!mounted ? (
                <div className="h-9 w-9 bg-neutral-100 rounded-full animate-pulse" />
              ) : isAuthenticated ? (
                <div>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    aria-label="Account Menu"
                    className="flex items-center gap-1.5 p-1 rounded-full border border-neutral-200 hover:border-brand transition-all bg-white"
                  >
                    <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center overflow-hidden text-neutral-700 text-xs font-bold">
                      {user?.image ? (
                        <Image src={user.image} alt={user.name || 'User'} width={32} height={32} className="w-full h-full object-cover" />
                      ) : (
                        user?.name ? user.name.charAt(0).toUpperCase() : <User size={16} />
                      )}
                    </div>
                    <ChevronDown size={14} className={`text-neutral-500 mr-1 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-neutral-200 shadow-elevated py-2 z-50 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-neutral-100 bg-surface/50">
                          <p className="text-xs font-bold text-neutral-900 truncate">{user?.name || 'Customer'}</p>
                          <p className="text-[11px] text-neutral-500 truncate mt-0.5">{user?.email || user?.phone || 'Logged In'}</p>
                        </div>

                        <div className="py-1">
                          <Link
                            href="/profile"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-surface hover:text-brand transition-colors"
                          >
                            <User size={15} className="text-neutral-400" />
                            <span>My Profile</span>
                          </Link>

                          <Link
                            href="/profile?tab=orders"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-surface hover:text-brand transition-colors"
                          >
                            <Package size={15} className="text-neutral-400" />
                            <span>My Orders</span>
                          </Link>

                          <Link
                            href="/track-order"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-surface hover:text-brand transition-colors lg:hidden"
                          >
                            <Truck size={15} className="text-neutral-400" />
                            <span>Track Order</span>
                          </Link>
                        </div>

                        <div className="border-t border-neutral-100 pt-1 mt-1">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                          >
                            <LogOut size={15} />
                            <span>Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button href="/login" variant="secondary" className="py-1.5 px-3.5 text-xs h-8">
                    Login
                  </Button>
                  <Button href="/login?register=true" className="py-1.5 px-3.5 text-xs h-8 bg-neutral-900 hover:bg-brand">
                    Sign Up
                  </Button>
                </div>
              )}
            </div>

            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-800 md:hidden focus:outline-none z-50"
              onClick={() => setOpen(state => !state)}
              aria-label="Toggle Menu"
            >
              <div className="relative w-4 h-4 flex items-center justify-center">
                <span className={`absolute h-[2px] w-4 bg-neutral-900 rounded-lg transition-all duration-300 ${open ? 'rotate-45' : '-translate-y-1'}`} />
                <span className={`absolute h-[2px] w-4 bg-neutral-900 rounded-lg transition-all duration-300 ${open ? 'opacity-0' : 'opacity-100'}`} />
                <span className={`absolute h-[2px] w-4 bg-neutral-900 rounded-lg transition-all duration-300 ${open ? '-rotate-45' : 'translate-y-1'}`} />
              </div>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[105] bg-editorial-dark/60 backdrop-blur-md md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
              className="fixed inset-y-0 right-0 z-[110] w-full max-w-xs bg-white p-6 shadow-2xl md:hidden flex flex-col justify-between overflow-y-auto"
            >
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
                  {settings?.logo ? (
                    <Image src={getDirectImageLink(settings.logo)} alt="AS SIDRAT" width={100} height={28} className="h-7 w-auto object-contain" />
                  ) : (
                    <span className="text-sm font-bold tracking-widest text-neutral-900 uppercase">AS SIDRAT</span>
                  )}
                  <button
                    type="button"
                    aria-label="Close menu"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 hover:border-black transition-colors text-xs font-bold"
                    onClick={() => setOpen(false)}
                  >
                    ✕
                  </button>
                </div>
                
                <nav className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[2px] text-neutral-400 mb-1 block px-2">Collections</span>
                  {menu.map(item => {
                    const isActive = pathname === item.href;
                    return (
                      <Link 
                        key={item.href} 
                        href={item.href} 
                        onClick={() => setOpen(false)} 
                        className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                          isActive 
                            ? 'text-brand bg-surface' 
                            : 'text-neutral-800 hover:text-brand hover:bg-surface'
                        }`}
                      >
                        <span>{item.label}</span>
                        <span className="text-neutral-300">→</span>
                      </Link>
                    );
                  })}

                  <div className="border-t border-neutral-100 my-2 pt-2">
                    <Link 
                      href="/track-order" 
                      onClick={() => setOpen(false)} 
                      className="flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-neutral-800 bg-surface hover:bg-neutral-100 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <Truck size={16} className="text-brand" />
                        <span>Track Order</span>
                      </div>
                      <span className="text-neutral-400">→</span>
                    </Link>
                  </div>
                </nav>
              </div>

              <div className="border-t border-neutral-100 pt-5 mt-auto">
                {isAuthenticated ? (
                  <div className="space-y-2.5">
                    <Link 
                      href="/profile" 
                      onClick={() => setOpen(false)} 
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-neutral-800 bg-surface hover:bg-neutral-100 transition-colors"
                    >
                      <User size={16} className="text-brand" />
                      <span>My Profile ({user?.name || 'Customer'})</span>
                    </Link>
                    <button 
                      onClick={() => { handleLogout(); setOpen(false); }} 
                      className="w-full text-center bg-neutral-900 text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-brand transition-all rounded-xl shadow-subtle"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-[2px] text-neutral-400 block px-2">Account</span>
                    <div className="grid grid-cols-2 gap-2.5">
                      <Link 
                        href="/login" 
                        onClick={() => setOpen(false)} 
                        className="text-center border border-neutral-200 py-3 text-xs font-bold uppercase tracking-wider text-neutral-800 hover:bg-surface rounded-xl"
                      >
                        Login
                      </Link>
                      <Link 
                        href="/login?register=true" 
                        onClick={() => setOpen(false)} 
                        className="text-center bg-neutral-900 text-white py-3 text-xs font-bold uppercase tracking-wider hover:bg-brand rounded-xl shadow-subtle"
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

      <WishlistDrawer />
    </>
  );
}
