'use client';

import { useEffect, useState } from 'react';
import { Loader2, Eye, X } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [verificationInput, setVerificationInput] = useState('');

  useEffect(() => {
    setVerificationInput('');
  }, [selectedOrder]);

  const isTxnIdMatched = selectedOrder && selectedOrder.transactionId 
    ? verificationInput.trim().toUpperCase() === selectedOrder.transactionId.trim().toUpperCase() 
    : false;

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
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

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      const data = await res.json();
      
      if (data.success) {
        setOrders(orders.map(order => order._id === orderId ? { ...order, orderStatus: newStatus } : order));
      }
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const handlePaymentStatusChange = async (orderId: string, newPaymentStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      });
      const data = await res.json();
      
      if (data.success) {
        setOrders(orders.map(order => order._id === orderId ? { ...order, paymentStatus: newPaymentStatus } : order));
        setSelectedOrder((prev: any) => prev && prev._id === orderId ? { ...prev, paymentStatus: newPaymentStatus } : prev);
      }
    } catch (error) {
      alert("Failed to update payment status");
    }
  };

  const handleVerifyConfirmPayment = async (order: any) => {
    try {
      const targetPaid = order.paidAmount !== undefined ? order.paidAmount : order.totalAmount;
      const targetPaymentStatus = targetPaid < order.totalAmount ? 'Partially Paid' : 'Paid';

      const res = await fetch(`/api/orders/${order._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: 'Confirmed', paymentStatus: targetPaymentStatus }),
      });
      const data = await res.json();
      
      if (data.success) {
        setOrders(orders.map(o => o._id === order._id ? { ...o, orderStatus: 'Confirmed', paymentStatus: targetPaymentStatus } : o));
        setSelectedOrder((prev: any) => prev && prev._id === order._id ? { ...prev, orderStatus: 'Confirmed', paymentStatus: targetPaymentStatus } : prev);
        setVerificationInput('');
      }
    } catch (error) {
      alert("Failed to confirm order and payment");
    }
  };

  const getStatusColor = (status: string) => {
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
    <div className="flex flex-col gap-6 p-6 lg:p-12 relative min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Orders Management</h1>
      </div>

      <div className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
           <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Order ID</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Customer Details</th>
                  <th className="p-4 font-medium">Total</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                   <tr><td colSpan={6} className="p-8 text-center text-gray-500">No orders yet.</td></tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order._id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-sm font-medium text-[#A31F24]">
                        #{order.orderId || order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-bold text-[#1A1A1A]">{order.shippingInfo.name}</div>
                        <div className="text-xs text-gray-500">{order.shippingInfo.phone}</div>
                        <div className="text-xs text-gray-400 truncate w-48">{order.shippingInfo.city}</div>
                      </td>
                      <td className="p-4 text-sm font-bold">
                        ৳ {order.totalAmount.toLocaleString()}
                        <div className="text-xs font-normal text-gray-400 mt-1">{order.paymentMethod}</div>
                      </td>
                      <td className="p-4">
                        <select 
                          value={order.orderStatus}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className={`text-xs font-bold px-2 py-1 rounded outline-none cursor-pointer border-none ${getStatusColor(order.orderStatus)}`}
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Processing">Processing</option>
                          <option value="Send to Courier">Send to Courier</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition inline-flex items-center gap-1 text-xs font-bold uppercase"
                        >
                           <Eye size={16} /> View
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  Order Details <span className="text-gray-400 font-normal">#{selectedOrder.orderId || selectedOrder._id.slice(-6).toUpperCase()}</span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-black p-2 bg-white rounded-full border border-gray-200">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Shipping info */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Shipping Information</h3>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-sm font-bold text-gray-900">{selectedOrder.shippingInfo.name}</p>
                    <p className="text-sm text-gray-600 mt-1">{selectedOrder.shippingInfo.phone}</p>
                    <p className="text-sm text-gray-600 mt-1">{selectedOrder.shippingInfo.address}</p>
                    <p className="text-sm text-gray-600 font-bold mt-1 uppercase tracking-tight">{selectedOrder.shippingInfo.city}</p>
                  </div>
                </div>

                {/* Payment info */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Payment & Status</h3>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Method</span>
                      <span className="text-sm font-bold">{selectedOrder.paymentMethod}</span>
                    </div>

                    {selectedOrder.transactionId && (
                      <div className="space-y-2">
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex justify-between items-center">
                          <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">TxnID</span>
                          <span className="text-sm font-mono font-black text-[#A31F24] tracking-wider select-all">{selectedOrder.transactionId}</span>
                        </div>
                        
                        {/* Payment Breakdown */}
                        <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2 text-xs font-semibold text-gray-700">
                          <div className="flex justify-between">
                            <span>Total Bill:</span>
                            <span className="font-bold">৳{selectedOrder.totalAmount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Amount Paid by Customer:</span>
                            <span className="font-bold text-emerald-600">
                              ৳{(selectedOrder.paidAmount !== undefined ? selectedOrder.paidAmount : selectedOrder.totalAmount).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between border-t pt-1.5 border-dashed">
                            <span>Due Amount:</span>
                            <span className="font-bold text-rose-600">
                              ৳{Math.max(0, selectedOrder.totalAmount - (selectedOrder.paidAmount !== undefined ? selectedOrder.paidAmount : selectedOrder.totalAmount)).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedOrder.paymentMethod === 'Mobile Banking' && selectedOrder.paymentStatus !== 'Paid' && selectedOrder.paymentStatus !== 'Partially Paid' && (
                      <div className="space-y-3 pt-2 border-t border-gray-200/50">
                        {/* TxnID Verification Input */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block ml-0.5">Verify Transaction ID</label>
                          <input
                            type="text"
                            placeholder="Enter received TxnID to verify..."
                            value={verificationInput}
                            onChange={(e) => setVerificationInput(e.target.value)}
                            className={`w-full border p-3 rounded-xl focus:bg-white outline-none transition-all text-xs font-medium ${
                              verificationInput && !isTxnIdMatched 
                                ? 'border-red-500 bg-red-50/10' 
                                : isTxnIdMatched 
                                ? 'border-emerald-500 bg-emerald-50/10 focus:border-emerald-500' 
                                : 'border-slate-200 bg-white focus:border-black'
                            }`}
                          />
                          {verificationInput && !isTxnIdMatched && (
                            <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest ml-1">Transaction ID does not match</p>
                          )}
                          {isTxnIdMatched && (
                            <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest ml-1">✓ Transaction ID matches exactly</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t border-gray-200/50">
                      <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Payment Status</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                        selectedOrder.paymentStatus === 'Paid' 
                          ? 'bg-green-50 text-green-800 border-green-200' 
                          : selectedOrder.paymentStatus === 'Partially Paid'
                          ? 'bg-orange-50 text-orange-850 border-orange-200'
                          : 'bg-yellow-50 text-yellow-800 border-yellow-200'
                      }`}>
                        {selectedOrder.paymentStatus || 'Pending'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-200/50">
                      <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Order Status</span>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${getStatusColor(selectedOrder.orderStatus)}`}>
                        {selectedOrder.orderStatus}
                      </span>
                    </div>

                    {selectedOrder.couponCode && (
                       <div className="flex justify-between items-center pt-2 border-t border-gray-200/50">
                         <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Coupon</span>
                         <span className="text-sm font-bold text-green-600">{selectedOrder.couponCode}</span>
                       </div>
                    )}
                  </div>

                  {/* Payment Confirmation Buttons */}
                  {selectedOrder.paymentMethod === 'Mobile Banking' && selectedOrder.paymentStatus !== 'Paid' && selectedOrder.paymentStatus !== 'Partially Paid' ? (
                    <button
                      onClick={() => handleVerifyConfirmPayment(selectedOrder)}
                      disabled={!isTxnIdMatched}
                      className={`w-full text-xs font-black uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 ${
                        isTxnIdMatched 
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer' 
                          : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                      }`}
                    >
                      {isTxnIdMatched ? '✓ Confirm Payment & Order' : 'Verify to Confirm'}
                    </button>
                  ) : selectedOrder.paymentMethod === 'Mobile Banking' && (selectedOrder.paymentStatus === 'Paid' || selectedOrder.paymentStatus === 'Partially Paid') ? (
                    <div className="flex flex-col gap-2">
                      <div className={`p-3 rounded-xl border text-center text-xs font-bold uppercase tracking-wide ${
                        selectedOrder.paymentStatus === 'Paid'
                          ? 'bg-green-50 text-green-800 border-green-100'
                          : 'bg-orange-50 text-orange-800 border-orange-100'
                      }`}>
                        ✓ {selectedOrder.paymentStatus === 'Paid' ? 'Payment Confirmed' : 'Partially Paid Confirmed'}
                      </div>
                      <button
                        onClick={() => handlePaymentStatusChange(selectedOrder._id, 'Pending')}
                        className="w-full text-center text-gray-400 hover:text-red-600 text-[10px] font-bold uppercase tracking-widest underline py-1"
                      >
                        Reset Payment Status to Pending
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Order Items</h3>
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      <tr>
                        <th className="p-4">Product</th>
                        <th className="p-4 text-center">Qty</th>
                        <th className="p-4 text-right">Price</th>
                        <th className="p-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedOrder.orderItems.map((item: any, idx: number) => (
                        <tr key={idx} className="text-sm">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-12 bg-gray-100 rounded overflow-hidden">
                                <img src={item.images?.[0]?.url || item.image} alt={item.title} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">{item.title}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.selectedSize} / {item.selectedColor}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-center font-bold">{item.quantity}</td>
                          <td className="p-4 text-right">৳ {item.price.toLocaleString()}</td>
                          <td className="p-4 text-right font-bold">৳ {(item.price * item.quantity).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 font-bold">
                      <tr>
                        <td colSpan={3} className="p-4 text-right text-gray-500 text-xs uppercase tracking-widest">Total Amount</td>
                        <td className="p-4 text-right text-[#A31F24] text-lg">৳ {selectedOrder.totalAmount.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setSelectedOrder(null)} className="px-6 py-2 bg-white border border-gray-200 text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-gray-100 transition-all">
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
