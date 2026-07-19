'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2, Tag, ArrowLeft, TrendingUp, TrendingDown,
  AlertTriangle, Clock, Percent, DollarSign, ShoppingBag
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

const PIE_COLORS = ['#A31F24', '#10B981', '#0F172A', '#F59E0B', '#6366F1', '#EC4899', '#14B8A6', '#F97316'];

function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

export default function CouponReportPage() {
  const router = useRouter();
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [startDate, setStartDate] = useState(formatDateForInput(thirtyDaysAgo));
  const [endDate, setEndDate] = useState(formatDateForInput(now));
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(async (start: string, end: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/coupons/report?startDate=${start}&endDate=${end}`);
      const json = await res.json();
      if (json.success) setData(json);
    } catch (err) {
      console.error('Failed to fetch coupon report:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport(startDate, endDate);
  }, []); // initial load

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReport(startDate, endDate);
  };

  // Quick range presets
  const setPreset = (days: number) => {
    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    setStartDate(formatDateForInput(start));
    setEndDate(formatDateForInput(end));
    fetchReport(formatDateForInput(start), formatDateForInput(end));
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="animate-spin text-[#A31F24]" size={40} />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Report...</p>
      </div>
    );
  }

  const s = data?.summary;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/coupons')} className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all bg-white">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Tag size={24} className="text-[#A31F24]" /> Coupon Performance Report
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Deep-dive analytics on coupon usage, discounts, and revenue impact.</p>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <form onSubmit={handleApply} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-400">Start Date</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
            className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-black transition-all" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-400">End Date</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
            className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-black transition-all" />
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map(days => (
            <button key={days} type="button" onClick={() => setPreset(days)}
              className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${
                startDate === formatDateForInput(new Date(Date.now() - days * 86400000))
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-black'
              }`}>
              Last {days}d
            </button>
          ))}
        </div>
        <button type="submit" className="px-5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#A31F24] transition-all shadow-sm">
          Apply
        </button>
      </form>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <ShoppingBag size={14} /> Coupon Orders
          </p>
          <p className="text-2xl font-black text-slate-900 mt-2">{s?.couponOrders || 0}</p>
          <p className="text-[11px] text-slate-500 mt-1">{s?.couponUsageRate || 0}% of total orders</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <DollarSign size={14} /> Total Discount
          </p>
          <p className="text-2xl font-black text-emerald-600 mt-2">৳{(s?.totalDiscount || 0).toLocaleString()}</p>
          <p className="text-[11px] text-slate-500 mt-1">{s?.discountRate || 0}% discount rate</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <Percent size={14} /> Avg Discount/Order
          </p>
          <p className="text-2xl font-black text-slate-900 mt-2">৳{(s?.avgDiscountPerCouponOrder || 0).toLocaleString()}</p>
          <p className="text-[11px] text-slate-500 mt-1">per coupon order</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <TrendingUp size={14} /> Revenue Impact
          </p>
          <p className="text-2xl font-black text-slate-900 mt-2">৳{(s?.totalRevenue || 0).toLocaleString()}</p>
          <p className="text-[11px] text-slate-500 mt-1">from coupon orders</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Coupon Discount Trend */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
            <TrendingDown size={16} className="text-emerald-600" /> Discount Trend
          </h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.trend || []}>
                <defs>
                  <linearGradient id="reportDiscount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  formatter={(value: any) => [`৳${value.toLocaleString()}`, 'Discount']} />
                <Area type="monotone" dataKey="couponDiscount" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#reportDiscount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders: With vs Without Coupon */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
            <ShoppingBag size={16} className="text-[#A31F24]" /> Coupon vs Non-Coupon Orders
          </h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.trend || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="orders" fill="#0F172A" radius={[4, 4, 0, 0]} name="Total Orders" />
                <Bar dataKey="couponOrders" fill="#10B981" radius={[4, 4, 0, 0]} name="Coupon Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Per-Coupon Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Per-Coupon Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500">
              <tr>
                <th className="p-4">Coupon</th>
                <th className="p-4">Orders</th>
                <th className="p-4">Total Discount</th>
                <th className="p-4">Revenue</th>
                <th className="p-4">Avg Order Value</th>
                <th className="p-4">Discount %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.perCoupon?.length > 0 ? data.perCoupon.map((c: any, i: number) => (
                <tr key={c._id} className="hover:bg-slate-50/50 transition-colors text-sm">
                  <td className="p-4">
                    <span className="bg-red-50 text-[#A31F24] font-black px-2 py-1 rounded text-xs border border-red-100">
                      {c._id}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-slate-800">{c.orderCount}x</td>
                  <td className="p-4 font-bold text-emerald-600">৳{c.totalDiscount.toLocaleString()}</td>
                  <td className="p-4 font-medium text-slate-700">৳{c.totalRevenue.toLocaleString()}</td>
                  <td className="p-4 font-medium text-slate-600">৳{Math.round(c.avgOrderValue).toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`text-xs font-black px-2 py-0.5 rounded ${
                      c.discountPercentage > 20 ? 'bg-rose-50 text-rose-700' :
                      c.discountPercentage > 10 ? 'bg-amber-50 text-amber-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {c.discountPercentage}%
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 italic">No coupon usage in this period.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Coupon Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expiring Soon */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <Clock size={16} className="text-amber-500" /> Expiring Soon (7 days)
          </h3>
          {data?.couponHealth?.expiringSoon?.length > 0 ? (
            <div className="space-y-3">
              {data.couponHealth.expiringSoon.map((c: any) => (
                <div key={c.code} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className="text-amber-600" />
                    <span className="font-bold text-sm text-slate-900">{c.code}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-amber-700">{c.daysLeft}d left</span>
                    <span className="text-[10px] text-slate-500 ml-2">{c.usedCount}{c.maxUses ? `/${c.maxUses}` : ''} uses</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic text-center py-6">No coupons expiring in the next 7 days.</p>
          )}
        </div>

        {/* Exhausted */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-rose-500" /> Exhausted Coupons
          </h3>
          {data?.couponHealth?.exhausted?.length > 0 ? (
            <div className="space-y-3">
              {data.couponHealth.exhausted.map((c: any) => (
                <div key={c.code} className="flex items-center justify-between p-3 bg-rose-50 rounded-xl border border-rose-100">
                  <span className="font-bold text-sm text-slate-900 line-through">{c.code}</span>
                  <span className="text-xs font-black text-rose-600">{c.usedCount}/{c.maxUses} used</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic text-center py-6">No coupons have reached their usage limit.</p>
          )}
        </div>
      </div>

    </div>
  );
}
