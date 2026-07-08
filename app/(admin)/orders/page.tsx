'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Loader2, Eye, Trash2, Search, Filter, Calendar, 
  X, CheckSquare, Square, RefreshCw, AlertCircle, Truck 
} from 'lucide-react';

const VALID_TRANSITIONS: Record<string, string[]> = {
  'Pending': ['Confirmed', 'Cancelled'],
  'Confirmed': ['Processing', 'Cancelled'],
  'Processing': ['Shipped', 'Cancelled'],
  'Shipped': ['Delivered', 'Cancelled'],
  'Delivered': ['Completed', 'Refunded'],
  'Completed': ['Refunded'],
  'Cancelled': [],
  'Refunded': []
};

const getStatusColor = (status: string) => {
  switch(status) {
    case 'Pending': return 'bg-yellow-50 text-yellow-800 border-yellow-250';
    case 'Confirmed': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'Processing': return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'Shipped': return 'bg-blue-50 text-blue-800 border-blue-200';
    case 'Delivered': return 'bg-green-50 text-green-800 border-green-200';
    case 'Completed': return 'bg-slate-100 text-slate-800 border-slate-300';
    case 'Cancelled': return 'bg-rose-50 text-rose-800 border-rose-200';
    case 'Refunded': return 'bg-purple-50 text-purple-800 border-purple-200';
    default: return 'bg-gray-50 text-gray-800 border-gray-200';
  }
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState('');

  // Modal States for "Shipped" transition validation
  const [isShippedModalOpen, setIsShippedModalOpen] = useState(false);
  const [shippedTargetOrder, setShippedTargetOrder] = useState<any>(null); // null if bulk update
  const [modalCourier, setModalCourier] = useState('');
  const [modalTracking, setModalTracking] = useState('');

  // Delete states
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, startDate, endDate]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await fetch(`/api/orders?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setStartDate('');
    setEndDate('');
    setSelectedIds([]);
  };

  const handleStatusChangeInline = async (order: any, newStatus: string) => {
    if (newStatus === 'Shipped') {
      setShippedTargetOrder(order);
      setModalCourier(order.courier || '');
      setModalTracking(order.trackingNumber || '');
      setIsShippedModalOpen(true);
      return;
    }

    try {
      const res = await fetch(`/api/orders/${order._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      const data = await res.json();
      
      if (data.success) {
        setOrders(orders.map(o => o._id === order._id ? { ...o, orderStatus: newStatus } : o));
      } else {
        alert(data.error || "Failed to update status");
        fetchOrders(); // Reload to reset select dropdown
      }
    } catch (error) {
      alert("Failed to update status");
      fetchOrders();
    }
  };

  const handleShippedModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalCourier.trim() || !modalTracking.trim()) {
      alert("Both courier name and tracking code are required.");
      return;
    }

    setIsShippedModalOpen(false);

    if (shippedTargetOrder) {
      // Single order update
      try {
        const res = await fetch(`/api/orders/${shippedTargetOrder._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            orderStatus: 'Shipped', 
            courier: modalCourier, 
            trackingNumber: modalTracking 
          }),
        });
        const data = await res.json();
        if (data.success) {
          setOrders(orders.map(o => o._id === shippedTargetOrder._id ? { 
            ...o, 
            orderStatus: 'Shipped', 
            courier: modalCourier, 
            trackingNumber: modalTracking 
          } : o));
          alert("Order updated to Shipped with courier info");
        } else {
          alert(data.error || "Failed to update order");
        }
      } catch (error) {
        alert("Error saving courier details");
      }
    } else {
      // Bulk update
      try {
        const res = await fetch('/api/orders/bulk', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            orderIds: selectedIds, 
            orderStatus: 'Shipped', 
            courier: modalCourier, 
            trackingNumber: modalTracking 
          }),
        });
        const data = await res.json();
        if (data.success) {
          setOrders(orders.map(o => selectedIds.includes(o._id) ? { 
            ...o, 
            orderStatus: 'Shipped',
            courier: modalCourier, 
            trackingNumber: modalTracking 
          } : o));
          alert(`Successfully updated ${data.count} orders to Shipped`);
          setSelectedIds([]);
          setBulkStatus('');
        } else {
          alert(data.error || "Failed to apply bulk update");
        }
      } catch (error) {
        alert("Error in bulk update");
      }
    }

    // Reset states
    setShippedTargetOrder(null);
    setModalCourier('');
    setModalTracking('');
  };

  const handleBulkStatusApply = async () => {
    if (selectedIds.length === 0) {
      alert("No orders selected");
      return;
    }
    if (!bulkStatus) {
      alert("Please select a status to apply");
      return;
    }

    if (bulkStatus === 'Shipped') {
      setShippedTargetOrder(null);
      setModalCourier('');
      setModalTracking('');
      setIsShippedModalOpen(true);
      return;
    }

    try {
      const res = await fetch('/api/orders/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: selectedIds, orderStatus: bulkStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(orders.map(o => selectedIds.includes(o._id) ? { ...o, orderStatus: bulkStatus } : o));
        alert(`Successfully updated ${data.count} orders status to ${bulkStatus}`);
        setSelectedIds([]);
        setBulkStatus('');
      } else {
        alert(data.error || "Failed to apply bulk update");
      }
    } catch (error) {
      alert("Failed to apply bulk update");
    }
  };

  const handleDeleteSingle = async (orderId: string) => {
    if (deleteConfirmText !== 'DELETE') {
      alert("Type 'DELETE' to confirm order deletion.");
      return;
    }
    setDeletingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setOrders(orders.filter(o => o._id !== orderId));
        alert("Order deleted successfully");
      } else {
        alert(data.error || "Failed to delete order");
      }
    } catch (error) {
      alert("Error deleting order");
    } finally {
      setDeletingId(null);
      setDeleteTargetId(null);
      setDeleteConfirmText('');
    }
  };

  const handleSelectAllToggle = () => {
    if (selectedIds.length === orders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(orders.map(o => o._id));
    }
  };

  const handleSelectToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-12 min-h-screen">
      
      {/* Page Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-[#1A1A1A] tracking-tight">Orders Management</h1>
          <p className="text-xs text-slate-500 mt-1">Search, filter, and manage orders strictly through the delivery funnel.</p>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
        
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by Order ID, Customer Name, or Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-xl text-sm outline-none transition-all font-medium"
            />
          </div>
          
          <button 
            type="submit"
            className="px-6 py-3 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#A31F24] transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Filter size={14} /> Search & Filter
          </button>
          
          <button 
            type="button"
            onClick={handleResetFilters}
            className="px-5 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 bg-white"
          >
            <RefreshCw size={14} /> Reset
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
          
          {/* Status filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Status filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-slate-200 p-2.5 rounded-xl text-xs font-bold bg-white outline-none focus:border-slate-400 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>

          {/* Date range start */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs outline-none bg-white font-semibold focus:border-slate-400"
              />
            </div>
          </div>

          {/* Date range end */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs outline-none bg-white font-semibold focus:border-slate-400"
              />
            </div>
          </div>

        </div>

      </div>

      {/* Bulk Actions Panel */}
      {selectedIds.length > 0 && (
        <div className="bg-[#A31F24]/5 border border-[#A31F24]/20 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2">
            <CheckSquare className="text-[#A31F24]" size={20} />
            <span className="text-xs font-black uppercase tracking-wider text-[#A31F24]">
              {selectedIds.length} orders selected
            </span>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="border border-[#A31F24]/30 rounded-xl px-3 py-2 text-xs font-bold bg-white outline-none cursor-pointer text-slate-900"
            >
              <option value="">Choose bulk status...</option>
              <option value="Confirmed">Mark Confirmed</option>
              <option value="Processing">Mark Processing</option>
              <option value="Shipped">Mark Shipped (Courier Required)</option>
              <option value="Delivered">Mark Delivered</option>
              <option value="Completed">Mark Completed</option>
              <option value="Cancelled">Mark Cancelled</option>
              <option value="Refunded">Mark Refunded</option>
            </select>

            <button
              onClick={handleBulkStatusApply}
              className="px-5 py-2.5 bg-[#A31F24] hover:bg-[#A31F24]/90 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm shadow-[#A31F24]/10"
            >
              Apply Status Update
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-black transition-all bg-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Table Data */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-[#A31F24]" size={36} />
            <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Fetching orders data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider border-b border-slate-100">
                  <th className="p-4 pl-6 w-12 text-center">
                    <button 
                      onClick={handleSelectAllToggle}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {selectedIds.length === orders.length && orders.length > 0 ? (
                        <CheckSquare size={18} className="text-[#A31F24]" />
                      ) : (
                        <Square size={18} />
                      )}
                    </button>
                  </th>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Customer info</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Courier / Tracking</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-slate-450 text-sm font-semibold">
                      No matching orders found.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const currentStatus = order.orderStatus || 'Pending';
                    const allowed = VALID_TRANSITIONS[currentStatus] || [];
                    const isSelected = selectedIds.includes(order._id);
                    return (
                      <tr 
                        key={order._id} 
                        className={`hover:bg-slate-50/50 transition-colors text-sm ${
                          isSelected ? 'bg-slate-50' : ''
                        }`}
                      >
                        <td className="p-4 pl-6 text-center">
                          <button 
                            onClick={() => handleSelectToggle(order._id)}
                            className="text-slate-400 hover:text-[#A31F24] transition-colors"
                          >
                            {isSelected ? (
                              <CheckSquare size={18} className="text-[#A31F24]" />
                            ) : (
                              <Square size={18} />
                            )}
                          </button>
                        </td>
                        <td className="p-4 font-mono font-bold text-[#A31F24]">
                          #{order.orderId || order._id.slice(-6).toUpperCase()}
                        </td>
                        <td className="p-4 text-slate-500 text-xs">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{order.shippingInfo.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{order.shippingInfo.phone}</div>
                          <div className="text-[10px] text-slate-450 uppercase tracking-tight mt-0.5">{order.shippingInfo.city}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate-900">৳{order.totalAmount.toLocaleString()}</div>
                          <div className="text-[10px] font-semibold text-slate-400 mt-0.5 uppercase">{order.paymentMethod}</div>
                        </td>
                        <td className="p-4 text-xs font-semibold text-slate-650">
                          {order.courier ? (
                            <div className="space-y-0.5">
                              <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold uppercase text-[9px] tracking-wide inline-block">{order.courier}</span>
                              <div className="text-[10px] font-mono text-slate-400 truncate w-32 select-all">{order.trackingNumber}</div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">None</span>
                          )}
                        </td>
                        <td className="p-4">
                          <select 
                            value={order.orderStatus}
                            onChange={(e) => handleStatusChangeInline(order, e.target.value)}
                            className={`text-xs font-bold px-2 py-1.5 rounded-lg outline-none border cursor-pointer ${getStatusColor(order.orderStatus)}`}
                          >
                            <option value={order.orderStatus}>{order.orderStatus}</option>
                            {allowed.map(target => (
                              <option key={target} value={target}>{target}</option>
                            ))}
                            {!allowed.includes('Cancelled') && order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Refunded' && order.orderStatus !== 'Completed' && (
                              <option value="Cancelled">Cancelled</option>
                            )}
                            {!allowed.includes('Refunded') && (order.orderStatus === 'Delivered' || order.orderStatus === 'Completed') && (
                              <option value="Refunded">Refunded</option>
                            )}
                          </select>
                        </td>
                        <td className="p-4 text-right pr-6">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => router.push(`/orders/${order._id}`)}
                              className="p-2 text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-black rounded-lg transition"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              onClick={() => setDeleteTargetId(order._id)}
                              className="p-2 text-rose-600 border border-rose-100 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition"
                              title="Delete Order"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Courier Input Modal for "Shipped" Transition */}
      {isShippedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                <Truck size={20} className="text-[#A31F24]" /> Enter Courier Details
              </h2>
              <button 
                onClick={() => {
                  setIsShippedModalOpen(false);
                  setShippedTargetOrder(null);
                  setModalCourier('');
                  setModalTracking('');
                  fetchOrders(); // Reset status select values
                }} 
                className="text-slate-400 hover:text-black p-1 bg-slate-50 rounded-full"
              >
                <X size={18} />
              </button>
            </div>
            
            <p className="text-xs text-slate-500 mb-4">
              {shippedTargetOrder 
                ? `Please input courier information to mark Order #${shippedTargetOrder.orderId || shippedTargetOrder._id.slice(-6).toUpperCase()} as Shipped.`
                : `Please input courier information to mark the ${selectedIds.length} selected orders as Shipped.`
              }
            </p>

            <form onSubmit={handleShippedModalSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Courier Name</label>
                <input 
                  type="text" 
                  placeholder="e.g., Pathao, RedX, Steadfast"
                  required
                  value={modalCourier}
                  onChange={(e) => setModalCourier(e.target.value)}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs font-semibold focus:border-slate-400 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Tracking Code / Consignment ID</label>
                <input 
                  type="text" 
                  placeholder="e.g., consignment code number"
                  required
                  value={modalTracking}
                  onChange={(e) => setModalTracking(e.target.value)}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs font-semibold focus:border-slate-400 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-50">
                <button 
                  type="button"
                  onClick={() => {
                    setIsShippedModalOpen(false);
                    setShippedTargetOrder(null);
                    setModalCourier('');
                    setModalTracking('');
                    fetchOrders(); // Reset status select values
                  }}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-slate-900 text-white hover:bg-[#A31F24] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm"
                >
                  Confirm Shipped
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl p-6 space-y-6">
            <div className="space-y-2">
              <h2 className="text-lg font-black text-rose-700 flex items-center gap-2">
                <AlertCircle size={22} /> Delete Order Permanently?
              </h2>
              <p className="text-xs text-slate-500">
                This action is irreversible. It will permanently remove this order from the database.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 block">
                Type <span className="font-mono text-rose-600 bg-rose-50 px-1 py-0.5 rounded">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                placeholder="DELETE"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full border border-slate-200 p-3 rounded-xl focus:border-rose-550 outline-none text-xs font-bold uppercase tracking-wider"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => {
                  setDeleteTargetId(null);
                  setDeleteConfirmText('');
                }}
                className="px-5 py-2.5 bg-white border border-slate-200 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDeleteSingle(deleteTargetId)}
                disabled={deletingId === deleteTargetId || deleteConfirmText !== 'DELETE'}
                className="px-5 py-2.5 bg-rose-650 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
              >
                {deletingId === deleteTargetId ? <Loader2 className="animate-spin" size={14} /> : null}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
