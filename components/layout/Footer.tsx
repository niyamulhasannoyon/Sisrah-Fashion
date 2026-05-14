"use client";

import { useSettingsStore } from '@/store/useSettingsStore';
import Link from 'next/link';

export function Footer() {
  const { settings } = useSettingsStore();

  return (
    <footer className="border-t border-slate-200 bg-white py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 text-sm text-slate-600 sm:px-8 lg:px-12 lg:flex-row lg:items-center lg:justify-between">
        <p>© {new Date().getFullYear()} AS SIDRAT. Built for Bangladesh with premium essentials and local delivery.</p>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <ul className="flex gap-4">
            <li><Link href="/track-order" className="text-sm text-slate-500 hover:text-black transition-colors">Track Order</Link></li>
          </ul>
          <p>Payments: bKash, Nagad, SSLCommerz-ready.</p>
          {settings?.whatsappNumber && (
            <a 
              href={`https://wa.me/${settings.whatsappNumber.replace(/\+/g, '')}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-loomra-red font-bold hover:underline"
            >
              Contact: {settings.whatsappNumber}
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
