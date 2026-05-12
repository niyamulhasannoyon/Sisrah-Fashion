'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, Tag } from 'lucide-react';

export default function CouponManagement() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    code: '', discountType: 'Percentage', discountValue: 0, minPurchase: 0, expiryDate: ''
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
      setFormData({ code: '', discountType: 'Percentage', discountValue: 0, minPurchase: 0, expiryDate: '' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Tag className="text-[#A31F24]" size={28} /> Coupon Management
          </h1>
          <p className="text-sm text-slate-500">Create and manage promotional discount codes.</p>
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
              <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Expiry Date</label>
              <input type="date" required value={formData.expiryDate}
                onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm transition-all" />
            </div>

            <button type="submit" className="w-full bg-black text-white py-4 rounded-xl font-bold text-sm hover:bg-[#A31F24] transition-all shadow-lg flex justify-center items-center gap-2">
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
                  <th className="p-4">Min. Spend</th>
                  <th className="p-4">Expiry</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      <Loader2 className="animate-spin mx-auto mb-2" /> Loading coupons...
                    </td>
                  </tr>
                ) : coupons.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                      No coupons found. Create your first one!
                    </td>
                  </tr>
                ) : coupons.map((c: any) => (
                  <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <span className="bg-red-50 text-[#A31F24] font-black px-2 py-1 rounded text-xs border border-red-100">{c.code}</span>
                    </td>
                    <td className="p-4 font-bold text-slate-700">
                      {c.discountValue}{c.discountType === 'Percentage' ? '%' : ' ৳'} OFF
                    </td>
                    <td className="p-4 text-slate-500 font-medium">৳ {c.minPurchase}</td>
                    <td className="p-4 text-slate-500 font-medium">
                      {new Date(c.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
