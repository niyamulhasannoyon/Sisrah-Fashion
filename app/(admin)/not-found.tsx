import Link from 'next/link';
import { FileQuestion, LayoutDashboard, ShoppingCart, Package } from 'lucide-react';

export const metadata = {
  title: 'Admin Resource Not Found | AS SIDRAT',
};

export default function AdminNotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 md:p-8">
      <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 text-slate-100 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
          <FileQuestion size={32} />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold block">
            404 • Resource Missing
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Admin Page Not Found
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
            The admin route or resource you are attempting to access does not exist or has been relocated.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#A31F24] hover:bg-[#8B1A1E] text-white text-xs font-semibold rounded-xl transition-all shadow-md active:scale-95"
          >
            <LayoutDashboard size={14} />
            <span>Go to Dashboard</span>
          </Link>

          <Link
            href="/orders"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all active:scale-95"
          >
            <ShoppingCart size={14} />
            <span>Orders</span>
          </Link>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all active:scale-95"
          >
            <Package size={14} />
            <span>Products</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
