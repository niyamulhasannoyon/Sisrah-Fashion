'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, Bell, Search, Tag } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout, checkAuth } = useAuthStore();
  const router = useRouter();
  const { settings, fetchSettings } = useSettingsStore();
  const [checking, setChecking] = useState(true);

  const allowedEmails = ['niyamulhasanbd@gmail.com', 'niyamulhasan1089@gmail.com'];

  useEffect(() => {
    const verifyAccess = async () => {
      await checkAuth();
      if (!settings) await fetchSettings();
      setChecking(false);
    };
    verifyAccess();
  }, []);

  useEffect(() => {
    if (!checking) {
      if (!user || !allowedEmails.includes(user.email)) {
        router.push('/');
      }
    }
  }, [checking, user, router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    logout();
    router.push('/login');
  };

  if (checking) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0F172A] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-700 border-t-[#A31F24] rounded-full animate-spin"></div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  if (!user || !allowedEmails.includes(user.email)) {
    return null;
  }

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Orders', href: '/orders', icon: ShoppingCart },
    { name: 'Customers', href: '/users', icon: Users },
    { name: 'Coupons', href: '/coupons', icon: Tag },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden">
      
      {/* Modern Dark Sidebar */}
      <aside className="w-[260px] bg-[#0F172A] text-slate-300 flex flex-col transition-all duration-300 border-r border-slate-800 hidden md:flex shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800/50">
          <Link href="/dashboard" className="text-xl font-bold tracking-widest text-white uppercase flex items-center gap-2">
            {settings?.logo ? (
              <img src={settings.logo} alt="Logo" className="h-8 w-auto object-contain" />
            ) : (
              <>
                <div className="w-6 h-6 bg-[#A31F24] rounded-sm flex items-center justify-center text-[10px]">AS</div>
                AS SIDRAT<span className="text-[#A31F24]">.</span>
              </>
            )}
          </Link>
        </div>

        <div className="p-4">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Menu</p>
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-[#1E293B] text-white shadow-sm ring-1 ring-slate-700' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <item.icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-slate-800/50">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Sleek Top Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative hidden md:block w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="w-full pl-9 pr-4 py-2 bg-slate-100/50 border-transparent focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-slate-100 rounded-lg text-sm outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-5">
            <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#A31F24] rounded-full ring-2 ring-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3 cursor-pointer group">
               <div className="text-right hidden sm:block">
                 <p className="text-sm font-bold text-slate-700 leading-none">{user?.name || 'Admin User'}</p>
                 <p className="text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-wider">{user?.role || 'Administrator'}</p>
               </div>
               <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 group-hover:ring-2 ring-slate-200 transition-all">
                 {user?.name?.charAt(0) || 'A'}
               </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>

      </main>
    </div>
  );
}