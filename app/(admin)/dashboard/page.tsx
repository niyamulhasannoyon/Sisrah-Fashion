'use client';

import { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, Users, TrendingUp, MoreVertical, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setData(json);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="animate-spin text-[#A31F24]" size={40} />
        <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Loading Dashboard...</p>
      </div>
    );
  }

  const stats = [
    { title: 'Total Revenue', value: `৳ ${data?.stats?.totalRevenue?.toLocaleString() || 0}`, increase: '+0%', isPositive: true, icon: DollarSign },
    { title: 'Total Orders', value: data?.stats?.totalOrders || 0, increase: '+0%', isPositive: true, icon: ShoppingBag },
    { title: 'Active Customers', value: data?.stats?.totalCustomers || 0, increase: '+0%', isPositive: true, icon: Users },
    { title: 'Conversion Rate', value: '0%', increase: '0%', isPositive: true, icon: TrendingUp },
  ];

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Here's what's happening with your store today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{stat.title}</p>
              <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-slate-600 transition-colors">
                <stat.icon size={18} />
              </div>
            </div>
            <div className="flex items-end gap-3">
              <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
            </div>
            <div className="mt-4 flex items-center gap-1.5">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stat.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {stat.increase}
              </span>
              <span className="text-xs font-medium text-slate-400">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Analytics Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-900">Revenue Analytics</h3>
          <select className="text-xs font-bold border border-slate-200 rounded-md p-2 outline-none bg-slate-50">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[
              { name: 'Mon', sales: 4000 },
              { name: 'Tue', sales: 3000 },
              { name: 'Wed', sales: 5000 },
              { name: 'Thu', sales: 2780 },
              { name: 'Fri', sales: 1890 },
              { name: 'Sat', sales: 2390 },
              { name: 'Sun', sales: 3490 },
            ]}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A31F24" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#A31F24" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
              <Tooltip 
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                itemStyle={{fontSize: '12px', fontWeight: 'bold', color: '#A31F24'}}
              />
              <Area type="monotone" dataKey="sales" stroke="#A31F24" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-2">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <h3 className="text-base font-bold text-slate-900">Recent Orders</h3>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">Order ID</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">Customer</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">Date</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">Amount</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {data?.recentOrders?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 text-sm italic">No orders yet.</td>
                </tr>
              ) : (
                data.recentOrders.map((order: any) => (
                  <tr key={order._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4">
                      <span className="text-sm font-bold text-slate-900">#{order._id.slice(-6).toUpperCase()}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                          {order.shippingInfo.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{order.shippingInfo.name}</p>
                          <p className="text-[11px] text-slate-500">{order.shippingInfo.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600 font-medium">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm font-bold text-slate-900">৳ {order.totalAmount.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        order.orderStatus === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-200/50' : 
                        order.orderStatus === 'Cancelled' ? 'bg-rose-50 text-rose-600 border-rose-200/50' : 
                        'bg-amber-50 text-amber-600 border-amber-200/50'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-slate-400 hover:text-slate-600 p-1"><MoreVertical size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}