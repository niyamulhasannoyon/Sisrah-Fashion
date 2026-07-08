'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Settings,
  LogOut, Bell, Search, Tag, BarChart3, MessageSquare, UserCog,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getDirectImageLink } from '@/lib/utils';
import { ROLE_PERMISSIONS, ROLE_LABELS, ROLE_COLORS } from '@/lib/staffPermissions';
import type { StaffRole } from '@/lib/staffPermissions';

// Nav item definitions keyed by permission key
const ALL_NAV_ITEMS = [
  { key: 'dashboard',  name: 'Dashboard',  href: '/dashboard',  icon: LayoutDashboard },
  { key: 'analytics',  name: 'Analytics',  href: '/analytics',  icon: BarChart3 },
  { key: 'products',   name: 'Products',   href: '/products',   icon: Package },
  { key: 'orders',     name: 'Orders',     href: '/orders',     icon: ShoppingCart },
  { key: 'customers',  name: 'Customers',  href: '/users',      icon: Users },
  { key: 'reviews',    name: 'Reviews',    href: '/reviews',    icon: MessageSquare },
  { key: 'coupons',    name: 'Coupons',    href: '/coupons',    icon: Tag },
  { key: 'staff',      name: 'Staff',      href: '/staff',      icon: UserCog },
  { key: 'settings',   name: 'Settings',   href: '/settings',   icon: Settings },
];

const SUPER_ADMIN_EMAILS = ['niyamulhasanbd@gmail.com', 'niyamulhasan1089@gmail.com'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout, checkAuth } = useAuthStore();
  const router = useRouter();
  const { settings, fetchSettings } = useSettingsStore();
  const [checking, setChecking] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/admin/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s poll
    return () => clearInterval(interval);
  }, []);

  const handleNotifClick = async (notif: any) => {
    try {
      if (!notif.isRead) {
        const res = await fetch('/api/admin/notifications', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: notif._id })
        });
        const data = await res.json();
        if (data.success) {
          setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
      setShowNotifDropdown(false);
      if (notif.link) {
        router.push(notif.link);
      }
    } catch (error) {
      console.error('Failed to handle notification click:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true })
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  useEffect(() => {
    const verifyAccess = async () => {
      await checkAuth();
      if (!settings) await fetchSettings();
      setChecking(false);
    };
    verifyAccess();
  }, []);

  // Determine if current user is super admin owner or a staff member
  const isSuperAdminOwner = user ? SUPER_ADMIN_EMAILS.includes(user.email) : false;
  const isStaffUser = user ? !!(user as any).isStaff : false;
  const staffRole = user?.role as StaffRole | undefined;

  useEffect(() => {
    if (!checking) {
      // Must be either original super admin OR an active staff member
      if (!user || (!isSuperAdminOwner && !isStaffUser)) {
        router.push('/');
      }
    }
  }, [checking, user, router, isSuperAdminOwner, isStaffUser]);

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
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Verifying Access...</p>
        </div>
      </div>
    );
  }

  if (!user || (!isSuperAdminOwner && !isStaffUser)) {
    return null;
  }

  // Build filtered nav based on role or per-staff permissions
  let allowedKeys: string[];
  if (isSuperAdminOwner) {
    // Original owner sees everything
    allowedKeys = ALL_NAV_ITEMS.map((i) => i.key);
  } else {
    // If the user has an explicit permissions array (set per-staff), use it.
    const userPerms = (user as any)?.permissions as string[] | undefined;
    if (userPerms && Array.isArray(userPerms) && userPerms.length > 0) {
      allowedKeys = userPerms;
    } else if (staffRole && ROLE_PERMISSIONS[staffRole]) {
      allowedKeys = ROLE_PERMISSIONS[staffRole];
    } else {
      allowedKeys = ['dashboard'];
    }
  }

  const navItems = ALL_NAV_ITEMS.filter((item) => allowedKeys.includes(item.key));

  // Role badge for header
  const roleBadgeLabel = isSuperAdminOwner
    ? 'Administrator'
    : staffRole
    ? ROLE_LABELS[staffRole]
    : user.role || 'Staff';

  const roleBadgeClass = isSuperAdminOwner
    ? 'bg-[#A31F24]/10 text-[#A31F24]'
    : staffRole
    ? ROLE_COLORS[staffRole]
    : 'bg-slate-100 text-slate-600';

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden">

      {/* Dark Sidebar */}
      <aside className="w-[260px] bg-[#0F172A] text-slate-300 flex flex-col transition-all duration-300 border-r border-slate-800 hidden md:flex shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800/50">
          <Link href="/dashboard" className="text-xl font-bold tracking-widest text-white uppercase flex items-center gap-2">
            {settings?.logo ? (
              <img src={getDirectImageLink(settings.logo)} alt="Logo" className="h-12 w-auto object-contain" />
            ) : (
              <>
                <div className="w-6 h-6 bg-[#A31F24] rounded-sm flex items-center justify-center text-[10px]">AS</div>
                AS SIDRAT<span className="text-[#A31F24]">.</span>
              </>
            )}
          </Link>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
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

        {/* Role badge in sidebar footer */}
        <div className="p-4 border-t border-slate-800/50 space-y-2">
          {!isSuperAdminOwner && staffRole && (
            <div className={`mx-1 mb-2 px-3 py-1.5 rounded-lg text-center text-[10px] font-black uppercase tracking-widest border ${ROLE_COLORS[staffRole]}`}>
              {ROLE_LABELS[staffRole]}
            </div>
          )}
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

        {/* Top Header */}
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
            <div className="relative">
              <button 
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100/80 cursor-pointer"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 bg-[#A31F24] text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white px-1 shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifDropdown && (
                <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">Notifications</h4>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllRead}
                        className="text-[10px] font-bold text-[#A31F24] hover:underline cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  
                  <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400 italic">No notifications yet.</div>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif._id}
                          onClick={() => handleNotifClick(notif)}
                          className={`p-4 hover:bg-slate-50/80 transition-colors cursor-pointer text-xs ${
                            !notif.isRead ? 'bg-slate-50/60 font-semibold' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <span className="text-slate-800 font-bold leading-tight">{notif.title}</span>
                            <span className="text-[9px] text-slate-400 font-medium shrink-0">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-500 font-medium leading-relaxed">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-700 leading-none">{user?.name || 'Admin'}</p>
                <p className={`text-[10px] font-black mt-1 uppercase tracking-wider px-2 py-0.5 rounded-full border ${roleBadgeClass}`}>
                  {roleBadgeLabel}
                </p>
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