'use client';

import { useEffect, useState } from 'react';
import { Loader2, Mail, Phone, Calendar, User as UserIcon } from 'lucide-react';

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('/api/admin/customers')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCustomers(data.customers);
        }
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Customer Directory</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and view all registered customers on your platform.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
           <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-[#A31F24]" size={32} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest border-b border-gray-100">
                  <th className="p-4 font-bold">Customer</th>
                  <th className="p-4 font-bold">Contact</th>
                  <th className="p-4 font-bold">Joined Date</th>
                  <th className="p-4 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.length === 0 ? (
                   <tr><td colSpan={4} className="p-12 text-center text-gray-500">No customers found.</td></tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-bold text-sm">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#1A1A1A]">{customer.name}</p>
                            <p className="text-xs text-gray-500 uppercase font-medium">{customer.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Mail size={12} className="text-gray-400" />
                            {customer.email}
                          </div>
                          {customer.phone && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Phone size={12} className="text-gray-400" />
                              {customer.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Calendar size={12} className="text-gray-400" />
                          {new Date(customer.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <span className="bg-green-100 text-green-800 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}