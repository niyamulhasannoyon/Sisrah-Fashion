'use client';

import { useEffect, useState } from 'react';
import { Loader2, Mail, Phone, Calendar, User as UserIcon, Eye, MapPin, X, ShoppingBag, Landmark } from 'lucide-react';
import Link from 'next/link';

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  
  useEffect(() => {
    fetch('/api/admin/customers')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setCustomers(data.customers);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching customers:", err);
        setLoading(false);
      });
  }, []);

  const getSignupSource = (customer: any) => {
    if (!customer.password) return 'Google Social Auth';
    return 'Direct Email/Phone Registration';
  };

  const getOrderStatusColor = (status: string) => {
    switch(status) {
      case 'Confirmed': return 'bg-emerald-100 text-emerald-800';
      case 'Processing': return 'bg-yellow-100 text-yellow-800';
      case 'Send to Courier': return 'bg-purple-100 text-purple-800';
      case 'Shipped': return 'bg-blue-100 text-blue-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-center border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Customer Directory</h1>
          <p className="text-sm text-gray-500 mt-1">Manage, analyze, and view order analytics of your registered customers.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-[#A31F24]" size={32} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest border-b border-slate-100">
                  <th className="p-4 font-bold">Customer</th>
                  <th className="p-4 font-bold">Contact</th>
                  <th className="p-4 font-bold text-center">Orders</th>
                  <th className="p-4 font-bold text-right">Lifetime Value</th>
                  <th className="p-4 font-bold text-center">Joined Date</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.length === 0 ? (
                  <tr><td colSpan={6} className="p-12 text-center text-gray-500">No customers found.</td></tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-bold text-sm select-none">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#1A1A1A]">{customer.name}</p>
                            <p className="text-[10px] text-gray-400 uppercase font-medium mt-0.5">{customer.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 text-xs text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <Mail size={12} className="text-gray-400" />
                            {customer.email}
                          </div>
                          {customer.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone size={12} className="text-gray-400" />
                              {customer.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center text-sm font-bold text-[#1A1A1A]">
                        {customer.totalOrders || 0}
                      </td>
                      <td className="p-4 text-right text-sm font-bold text-slate-800">
                        ৳ {(customer.totalSpent || 0).toLocaleString()}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
                          <Calendar size={12} className="text-gray-400" />
                          {new Date(customer.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedCustomer(customer)}
                          className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-800 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-250 flex items-center gap-1.5 ml-auto shadow-sm"
                        >
                          <Eye size={12} /> Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer details modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom-6 duration-300">
            {/* Header */}
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-lg font-bold">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{selectedCustomer.name}</h2>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">Customer details ID: {selectedCustomer._id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCustomer(null)} 
                className="text-slate-400 hover:text-black p-2 bg-white rounded-full border border-slate-200 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Profile Stats */}
                <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-450">Contact & Profile</h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Email:</span>
                      <span className="font-semibold text-slate-800">{selectedCustomer.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Phone:</span>
                      <span className="font-semibold text-slate-800">{selectedCustomer.phone || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Signup Source:</span>
                      <span className="font-bold text-[#A31F24]">{getSignupSource(selectedCustomer)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Joined Date:</span>
                      <span className="font-semibold text-slate-800">{new Date(selectedCustomer.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                    </div>
                  </div>
                </div>

                {/* Purchase Stats */}
                <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-450">Purchase Summary</h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Orders Placed:</span>
                      <span className="font-bold text-slate-800 text-sm">{selectedCustomer.totalOrders || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Lifetime Spent (LTV):</span>
                      <span className="font-bold text-emerald-600 text-sm">৳ {(selectedCustomer.totalSpent || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Average Order Value (AOV):</span>
                      <span className="font-semibold text-slate-800">
                        ৳ {selectedCustomer.totalOrders > 0 ? Math.round(selectedCustomer.totalSpent / selectedCustomer.totalOrders).toLocaleString() : 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Addresses history */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1">
                  <MapPin size={14} className="text-slate-400" /> Shipping Addresses Used
                </h3>
                <div className="bg-white border border-slate-100 rounded-xl p-4 text-xs space-y-2">
                  {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 ? (
                    selectedCustomer.addresses.map((address: string, idx: number) => (
                      <div key={idx} className="flex gap-2 items-start py-1.5 border-b last:border-b-0 border-slate-50">
                        <span className="w-5 h-5 bg-slate-50 rounded-full flex items-center justify-center font-bold text-slate-400 shrink-0">{idx + 1}</span>
                        <span className="text-slate-700 leading-relaxed">{address}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-450 italic">No addresses saved yet (No delivered orders).</p>
                  )}
                </div>
              </div>

              {/* Order history */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1">
                  <ShoppingBag size={14} className="text-slate-400" /> Order History
                </h3>
                {selectedCustomer.orderHistory && selectedCustomer.orderHistory.length > 0 ? (
                  <div className="border border-slate-100 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                        <tr>
                          <th className="p-3">Order ID</th>
                          <th className="p-3">Date</th>
                          <th className="p-3 text-right">Amount</th>
                          <th className="p-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedCustomer.orderHistory.map((order: any) => (
                          <tr key={order._id} className="hover:bg-slate-50/50 transition">
                            <td className="p-3 font-semibold text-[#A31F24]">
                              <Link href="/orders" onClick={() => setSelectedCustomer(null)} className="hover:underline">
                                #{order.orderId || order._id.slice(-6).toUpperCase()}
                              </Link>
                            </td>
                            <td className="p-3 text-slate-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-3 text-right font-bold text-slate-750">
                              ৳ {order.totalAmount.toLocaleString()}
                            </td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getOrderStatusColor(order.orderStatus)}`}>
                                {order.orderStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 bg-slate-50 rounded-xl text-center text-xs text-gray-400 italic">
                    No order history found for this user.
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-slate-50 flex justify-end gap-3 shrink-0">
              <button 
                onClick={() => setSelectedCustomer(null)} 
                className="px-5 py-2 bg-white border border-slate-200 text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-slate-100 transition"
              >
                Close details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}