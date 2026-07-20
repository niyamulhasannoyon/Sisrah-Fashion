'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, Tag, Clock, Users, X, BarChart3, ArrowUpRight } from 'lucide-react';

export default function CouponManagement() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    code: '', discountType: 'Percentage', discountValue: 0, minPurchase: 0, maxUses: null as number | null, expiryDate: ''
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    const res = await fetch('/api/admin/coupons');
    const data = await res.json();
    if (data.success) setCoupons(data.coupons);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      fetchCoupons();
      setFormData({ code: '', discountType: 'Percentage', discountValue: 0, minPurchase: 0, maxUses: null, expiryDate: '' });
    }
  };

  // ── Coupon Usage History Modal ────────────────────────────────────────────
  const [historyModal, setHistoryModal] = useState<{ open: boolean; code: string }>({ open: false, code: '' });
  const [historyData, setHistoryData] = useState<any>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const openHistory = async (code: string) => {
    setHistoryModal({ open: true, code });
    setHistoryLoading(true);
    setHistoryData(null);
    try {
      const res = await fetch(`/api/admin/coupons/history?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (data.success) {
        setHistoryData(data);
      }
    } catch (error) {
      console.error('Failed to load coupon history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchCoupons();
      } else {
        alert("Failed to delete coupon");
      }
    } catch (error) {
      alert("Failed to delete coupon");
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Tag className="text-[#A31F24]" size={28} /> Coupon Management
            </h1>
            <p className="text-sm text-slate-500">Create and manage promotional discount codes.</p>
          </div>
          <a href="/coupons/report"
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-600 hover:text-[#A31F24] hover:border-[#A31F24]/30 active:text-[#A31F24] active:scale-[0.97] transition-all shadow-sm">
            <BarChart3 size={14} />
            Report
            <ArrowUpRight size={12} />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Coupon Form */}
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 h-fit">
          <h3 className="font-bold text-slate-800 border-b pb-2">Create New Coupon</h3>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Coupon Code</label>
              <input type="text" placeholder="e.g. SAVE20" required value={formData.code}
                onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-black text-sm transition-all" />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Discount Type</label>
              <select value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm cursor-pointer transition-all">
                <option value="Percentage">Percentage (%)</option>
                <option value="Fixed">Fixed Amount (৳)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Value</label>
                <input type="number" placeholder="20" required value={formData.discountValue}
                  onChange={e => setFormData({...formData, discountValue: Number(e.target.value)})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Min Spend</label>
                <input type="number" placeholder="500" required value={formData.minPurchase}
                  onChange={e => setFormData({...formData, minPurchase: Number(e.target.value)})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm transition-all" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Max Uses</label>
              <input type="number" placeholder="Leave empty for unlimited" value={formData.maxUses ?? ''}
                onChange={e => setFormData({...formData, maxUses: e.target.value ? Number(e.target.value) : null})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm transition-all" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Expiry Date</label>
              <input type="date" required value={formData.expiryDate}
                onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm transition-all" />
            </div>

            <button type="submit" className="w-full bg-black text-white py-4 rounded-xl font-bold text-sm hover:bg-[#A31F24] active:scale-[0.97] transition-all shadow-lg flex justify-center items-center gap-2">
              <Plus size={18} /> Create Coupon
            </button>
          </div>
        </form>

        {/* Coupon List Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-800">Active Coupons</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-white text-slate-400 uppercase text-[10px] font-bold tracking-widest border-b">
                <tr>
                  <th className="p-4">Code</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4">Total Savings</th>
                  <th className="p-4">Usage</th>
                  <th className="p-4">Min. Spend</th>
                  <th className="p-4">Expiry</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      <Loader2 className="animate-spin mx-auto mb-2" /> Loading coupons...
                    </td>
                  </tr>
                ) : coupons.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                      No coupons found. Create your first one!
                    </td>
                  </tr>
                ) : coupons.map((c: any) => {
                  const isExhausted = c.maxUses && c.usedCount >= c.maxUses;
                  return (
                    <tr key={c._id} className={`hover:bg-slate-50 transition-colors ${isExhausted ? 'opacity-50' : ''}`}>
                      <td className="p-4">
                        <span className={`font-black px-2 py-1 rounded text-xs border ${isExhausted ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-red-50 text-[#A31F24] border-red-100'}`}>
                          {c.code}
                        </span>
                        {isExhausted && <span className="ml-2 text-[9px] text-slate-400 font-bold uppercase tracking-wider">Exhausted</span>}
                      </td>
                      <td className="p-4 font-bold text-slate-700">
                        {c.discountValue}{c.discountType === 'Percentage' ? '%' : ' ৳'} OFF
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-black text-emerald-600">
                          ৳{(c.totalDiscount || 0).toLocaleString()}
                        </span>
                        {c.totalDiscount > 0 && (
                          <span className="text-[9px] text-slate-400 ml-1.5 font-medium">
                            saved
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-black ${isExhausted ? 'text-red-500' : 'text-slate-500'}`}>
                          {c.usedCount || 0}{c.maxUses ? ` / ${c.maxUses}` : ' ✓ Unlimited'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 font-medium">৳ {c.minPurchase}</td>
                      <td className="p-4 text-slate-500 font-medium">
                        {new Date(c.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right flex items-center justify-end gap-1">
                        <button 
                          onClick={() => openHistory(c.code)}
                          className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-300 hover:text-blue-500 active:text-blue-700 transition-colors"
                          title="View usage history"
                        >
                          <Clock size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(c._id)}
                          className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-300 hover:text-red-500 active:text-red-700 transition-colors"
                          title="Delete coupon"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Coupon Usage History Modal ───────────────────────────────────── */}
      {historyModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setHistoryModal({ open: false, code: '' })}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-[#A31F24]" />
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Usage History
                </h2>
                <span className="bg-red-50 text-[#A31F24] font-black px-2 py-0.5 rounded text-xs border border-red-100 ml-1">
                  {historyModal.code}
                </span>
              </div>
              <button 
                onClick={() => setHistoryModal({ open: false, code: '' })}
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-slate-100 active:bg-slate-200 rounded-full transition-colors"
              >
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {historyLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="animate-spin text-[#A31F24]" size={32} />
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading history...</p>
                </div>
              ) : historyData && historyData.grouped && historyData.grouped.length > 0 ? (
                <>
                  {/* Summary stats */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Uses</p>
                      <p className="text-2xl font-black text-slate-900 mt-1">
                        {historyData.grouped[0]?.totalUses || 0}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Discount</p>
                      <p className="text-2xl font-black text-emerald-600 mt-1">
                        ৳{(historyData.grouped[0]?.totalDiscount || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Revenue from Used</p>
                      <p className="text-2xl font-black text-slate-900 mt-1">
                        ৳{(historyData.grouped[0]?.totalRevenue || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                      <Users size={14} /> Usage Log ({historyData.totalEntries} entries)
                    </h4>

                    {historyData.history.map((entry: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors group">
                        {/* Timeline dot + line */}
                        <div className="flex flex-col items-center shrink-0">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#A31F24] ring-2 ring-red-50" />
                          {idx < historyData.history.length - 1 && (
                            <div className="w-px h-full min-h-[8px] bg-slate-200 mt-1" />
                          )}
                        </div>

                        {/* Order info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-slate-900">{entry.customerName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{entry.customerPhone}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-[11px] text-slate-500">Order #{entry.orderId}</span>
                            <span className="text-[11px] text-slate-400">•</span>
                            <span className="text-[11px] text-slate-500">{new Date(entry.date).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Amounts */}
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-slate-900">৳{entry.totalAmount.toLocaleString()}</p>
                          <p className="text-[10px] font-bold text-emerald-600">- ৳{entry.discount.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <Clock size={40} className="opacity-30 mb-3" />
                  <p className="text-sm font-bold">No usage history yet</p>
                  <p className="text-xs mt-1">This coupon hasn't been used on any orders.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
