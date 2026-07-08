'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, Loader2, Save, Trash2, 
  MapPin, User, CreditCard, Truck, FileText, CheckCircle2, AlertCircle 
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
    case 'Pending': return 'bg-yellow-50 text-yellow-800 border border-yellow-200';
    case 'Confirmed': return 'bg-emerald-50 text-emerald-800 border border-emerald-200';
    case 'Processing': return 'bg-amber-50 text-amber-800 border border-amber-200';
    case 'Shipped': return 'bg-blue-50 text-blue-800 border border-blue-200';
    case 'Delivered': return 'bg-green-50 text-green-800 border border-green-200';
    case 'Completed': return 'bg-slate-100 text-slate-800 border border-slate-300';
    case 'Cancelled': return 'bg-rose-50 text-rose-800 border border-rose-200';
    case 'Refunded': return 'bg-purple-50 text-purple-800 border border-purple-200';
    default: return 'bg-gray-50 text-gray-800 border border-gray-200';
  }
};

export default function OrderDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notesSaving, setNotesSaving] = useState(false);
  const [courierSaving, setCourierSaving] = useState(false);

  // Form states
  const [status, setStatus] = useState('');
  const [courier, setCourier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [verificationInput, setVerificationInput] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
        setStatus(data.order.orderStatus);
        setCourier(data.order.courier || '');
        setTrackingNumber(data.order.trackingNumber || '');
        setInternalNotes(data.order.internalNotes || '');
      } else {
        alert(data.error || 'Failed to load order');
        router.push('/orders');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      alert('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === 'Shipped' && (!courier.trim() || !trackingNumber.trim())) {
      alert('Please fill out courier name and tracking number before setting status to Shipped.');
      return;
    }

    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderStatus: newStatus,
          courier: newStatus === 'Shipped' ? courier : undefined,
          trackingNumber: newStatus === 'Shipped' ? trackingNumber : undefined
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
        setStatus(data.order.orderStatus);
        alert('Order status updated successfully');
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (error) {
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveCourierInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setCourierSaving(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courier, trackingNumber }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
        alert('Courier information updated');
      } else {
        alert(data.error || 'Failed to save courier info');
      }
    } catch (error) {
      alert('Failed to save courier info');
    } finally {
      setCourierSaving(false);
    }
  };

  const handleSaveNotes = async () => {
    setNotesSaving(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internalNotes }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
        alert('Internal notes saved successfully');
      } else {
        alert(data.error || 'Failed to save internal notes');
      }
    } catch (error) {
      alert('Failed to save internal notes');
    } finally {
      setNotesSaving(false);
    }
  };

  const handleVerifyConfirmPayment = async () => {
    setUpdating(true);
    try {
      const targetPaid = order.paidAmount !== undefined ? order.paidAmount : order.totalAmount;
      const targetPaymentStatus = targetPaid < order.totalAmount ? 'Partially Paid' : 'Paid';

      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: 'Confirmed', paymentStatus: targetPaymentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
        setStatus(data.order.orderStatus);
        setVerificationInput('');
        alert('Payment verified and order confirmed');
      } else {
        alert(data.error || 'Failed to confirm order');
      }
    } catch (error) {
      alert('Failed to confirm order');
    } finally {
      setUpdating(false);
    }
  };

  const handleResetPaymentStatus = async () => {
    if (!confirm('Are you sure you want to reset payment status to Pending?')) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'Pending' }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
        alert('Payment status reset to Pending');
      } else {
        alert(data.error || 'Failed to reset payment status');
      }
    } catch (error) {
      alert('Failed to reset payment status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (deleteInput !== 'DELETE') {
      alert("Please type 'DELETE' to confirm deletion");
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        alert('Order deleted successfully');
        router.push('/orders');
      } else {
        alert(data.error || 'Failed to delete order');
      }
    } catch (error) {
      alert('Failed to delete order');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#A31F24]" size={40} />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Order Details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4 text-slate-500">
        <AlertCircle size={40} className="text-red-500" />
        <p className="text-sm font-bold">Order not found.</p>
        <button onClick={() => router.push('/orders')} className="mt-2 text-xs font-bold text-[#A31F24] hover:underline flex items-center gap-1">
          <ArrowLeft size={16} /> Back to Orders
        </button>
      </div>
    );
  }

  const currentStatus = order.orderStatus || 'Pending';
  const allowedTransitions = VALID_TRANSITIONS[currentStatus] || [];
  const isTxnIdMatched = order.transactionId 
    ? verificationInput.trim().toUpperCase() === order.transactionId.trim().toUpperCase() 
    : false;

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-8 min-h-screen max-w-7xl mx-auto">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/orders')}
            className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all bg-white"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Order Details <span className="text-slate-450 font-normal">#{order.orderId || order._id.slice(-6).toUpperCase()}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Placed on {new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2"
          >
            <Trash2 size={16} /> Delete Order
          </button>
        </div>
      </div>

      {/* Main Grid Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Items list, Internal Notes) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Order Status Flow Indicator */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#A31F24]" /> Order Status Flow
            </h3>
            
            <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-600 font-bold uppercase mr-2">Current Status:</span>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${getStatusColor(currentStatus)}`}>
                {currentStatus}
              </span>
              
              <div className="flex-1 min-w-[200px] flex items-center gap-2 sm:ml-4 mt-2 sm:mt-0">
                <span className="text-xs text-slate-500">Transition to:</span>
                {updating ? (
                  <Loader2 className="animate-spin text-[#A31F24]" size={16} />
                ) : (
                  <select 
                    value={currentStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="text-xs font-bold px-2 py-1.5 rounded-lg outline-none border border-slate-200 bg-white cursor-pointer"
                  >
                    <option value={currentStatus} disabled>{currentStatus} (current)</option>
                    
                    {/* Strict Flow Options */}
                    {allowedTransitions.map(target => (
                      <option key={target} value={target}>{target}</option>
                    ))}
                    
                    {/* Expose Cancelled/Refunded exceptions if not already allowed */}
                    {!allowedTransitions.includes('Cancelled') && currentStatus !== 'Cancelled' && currentStatus !== 'Refunded' && currentStatus !== 'Completed' && (
                      <option value="Cancelled">Cancelled (Exception)</option>
                    )}
                    {!allowedTransitions.includes('Refunded') && (currentStatus === 'Delivered' || currentStatus === 'Completed') && (
                      <option value="Refunded">Refunded (Exception)</option>
                    )}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Order Items Table */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Order Items</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="p-4 pl-6">Product</th>
                    <th className="p-4 text-center">Qty</th>
                    <th className="p-4 text-right">Unit Price</th>
                    <th className="p-4 text-right pr-6">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.orderItems.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors text-sm">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-16 bg-slate-50 rounded-lg overflow-hidden border border-slate-150 shrink-0">
                            <img src={item.images?.[0]?.url || item.image} alt={item.title} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">{item.title}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                              Size: {item.selectedSize} / Color: {item.selectedColor}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center font-bold text-slate-800">{item.quantity}</td>
                      <td className="p-4 text-right font-medium text-slate-700">৳ {item.price.toLocaleString()}</td>
                      <td className="p-4 text-right font-bold text-slate-900 pr-6">৳ {(item.price * item.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 border-t border-slate-100 font-bold text-slate-950 text-sm">
                  <tr>
                    <td colSpan={3} className="p-4 pl-6 text-right text-slate-500 text-xs uppercase tracking-wider">Total amount</td>
                    <td className="p-4 text-right text-[#A31F24] text-lg pr-6">৳ {order.totalAmount.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Internal Notes Section */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <FileText size={16} className="text-[#A31F24]" /> Internal Admin Notes
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">Notes written here are only visible to staff and administrators. Customers cannot view this information.</p>
            
            <div className="space-y-3">
              <textarea 
                rows={4}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Write internal team notes here..."
                className="w-full p-4 border border-slate-200 rounded-xl focus:border-slate-400 outline-none text-sm transition-all"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSaveNotes}
                  disabled={notesSaving}
                  className="px-4 py-2 bg-slate-900 text-white hover:bg-[#A31F24] font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                >
                  {notesSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                  Save Notes
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (Customer, Payment, Shipping, Courier) */}
        <div className="space-y-8">
          
          {/* Customer & Shipping info */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <User size={16} className="text-[#A31F24]" /> Customer Information
            </h3>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3 text-sm text-slate-700">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400">Name</p>
                <p className="font-bold text-slate-900 mt-0.5">{order.shippingInfo.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400">Phone</p>
                <p className="font-bold text-slate-900 mt-0.5 select-all">{order.shippingInfo.phone}</p>
              </div>
            </div>

            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2 pt-2">
              <MapPin size={16} className="text-[#A31F24]" /> Shipping Address
            </h3>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3 text-sm text-slate-700">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400">Address</p>
                <p className="font-medium text-slate-900 mt-0.5">{order.shippingInfo.address}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400">City</p>
                <p className="font-bold text-slate-900 mt-0.5 uppercase tracking-wide">{order.shippingInfo.city}</p>
              </div>
            </div>
          </div>

          {/* Payment Status Info */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <CreditCard size={16} className="text-[#A31F24]" /> Payment Information
            </h3>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 font-bold uppercase">Method</span>
                <span className="font-bold text-slate-900">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-200/50 pt-2">
                <span className="text-xs text-slate-500 font-bold uppercase">Status</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                  order.paymentStatus === 'Paid' 
                    ? 'bg-green-50 text-green-800 border-green-200' 
                    : order.paymentStatus === 'Partially Paid'
                    ? 'bg-orange-50 text-orange-900 border-orange-200'
                    : 'bg-yellow-50 text-yellow-800 border-yellow-200'
                }`}>
                  {order.paymentStatus || 'Pending'}
                </span>
              </div>

              {order.transactionId && (
                <div className="space-y-2 border-t border-slate-200/50 pt-3">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-bold uppercase">Txn ID</span>
                    <span className="text-xs font-mono font-black text-[#A31F24] tracking-wider select-all">
                      {order.transactionId}
                    </span>
                  </div>
                  
                  {/* Bill details */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2 text-xs font-semibold text-slate-700">
                    <div className="flex justify-between">
                      <span>Total Bill:</span>
                      <span className="font-bold">৳{order.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Paid Amount:</span>
                      <span className="font-bold text-emerald-600">
                        ৳{(order.paidAmount !== undefined ? order.paidAmount : order.totalAmount).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-1.5 border-dashed border-slate-200">
                      <span>Due Amount:</span>
                      <span className="font-bold text-rose-600">
                        ৳{Math.max(0, order.totalAmount - (order.paidAmount !== undefined ? order.paidAmount : order.totalAmount)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Verification panel if Mobile payment and not confirmed */}
            {order.paymentMethod === 'Mobile Banking' && order.paymentStatus !== 'Paid' && order.paymentStatus !== 'Partially Paid' && (
              <div className="border border-slate-200 p-4 rounded-xl space-y-3 bg-slate-50/50">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 block">Verify Transaction ID</label>
                  <input
                    type="text"
                    placeholder="Enter received Txn ID..."
                    value={verificationInput}
                    onChange={(e) => setVerificationInput(e.target.value)}
                    className={`w-full border p-2.5 rounded-lg focus:bg-white outline-none transition-all text-xs font-medium ${
                      verificationInput && !isTxnIdMatched 
                        ? 'border-red-500 bg-red-50/10' 
                        : isTxnIdMatched 
                        ? 'border-emerald-500 bg-emerald-50/10' 
                        : 'border-slate-200 bg-white'
                    }`}
                  />
                  {verificationInput && !isTxnIdMatched && (
                    <p className="text-red-500 text-[10px] font-bold">Transaction ID does not match</p>
                  )}
                  {isTxnIdMatched && (
                    <p className="text-emerald-600 text-[10px] font-bold">✓ Transaction ID matches exactly</p>
                  )}
                </div>

                <button
                  onClick={handleVerifyConfirmPayment}
                  disabled={!isTxnIdMatched || updating}
                  className={`w-full text-[10px] font-black uppercase tracking-wider py-2.5 rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                    isTxnIdMatched 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer' 
                      : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  }`}
                >
                  {updating ? <Loader2 className="animate-spin" size={12} /> : null}
                  Confirm Payment
                </button>
              </div>
            )}

            {order.paymentMethod === 'Mobile Banking' && (order.paymentStatus === 'Paid' || order.paymentStatus === 'Partially Paid') && (
              <div className="flex flex-col gap-2 pt-2">
                <div className="p-2.5 rounded-lg border text-center text-xs font-bold uppercase tracking-wide bg-green-50 text-green-800 border-green-150">
                  ✓ Payment Confirmed
                </div>
                <button
                  onClick={handleResetPaymentStatus}
                  disabled={updating}
                  className="w-full text-center text-slate-450 hover:text-rose-600 text-[10px] font-bold uppercase tracking-wider underline py-1"
                >
                  Reset Payment to Pending
                </button>
              </div>
            )}
          </div>

          {/* Courier Info / Form */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Truck size={16} className="text-[#A31F24]" /> Courier Details
            </h3>

            <form onSubmit={handleSaveCourierInfo} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500 block">Courier Name</label>
                <input 
                  type="text" 
                  placeholder="e.g., Pathao, RedX, Steadfast"
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                  className="w-full border border-slate-200 p-2.5 rounded-lg text-xs font-medium outline-none focus:border-slate-455"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500 block">Tracking / Consignment ID</label>
                <input 
                  type="text" 
                  placeholder="e.g., consignment tracking code"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full border border-slate-200 p-2.5 rounded-lg text-xs font-medium outline-none focus:border-slate-455"
                />
              </div>

              {currentStatus === 'Processing' && (!courier.trim() || !trackingNumber.trim()) && (
                <div className="bg-amber-50 border border-amber-150 p-3 rounded-lg flex gap-2 text-[11px] text-amber-800">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>Both courier name and tracking code must be filled before moving this order to <strong>Shipped</strong>.</span>
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={courierSaving}
                  className="px-4 py-2 bg-slate-900 text-white hover:bg-[#A31F24] font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                >
                  {courierSaving ? <Loader2 className="animate-spin" size={12} /> : <Save size={12} />}
                  Save Courier
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl p-6 space-y-6">
            <div className="space-y-2">
              <h2 className="text-lg font-black text-rose-700 flex items-center gap-2">
                <AlertCircle size={22} /> Delete Order Permanently?
              </h2>
              <p className="text-xs text-slate-500">
                This action is irreversible. It will permanently delete Order <strong>#{order.orderId || order._id.slice(-6).toUpperCase()}</strong> from the database.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 block">
                Type <span className="font-mono text-rose-600 bg-rose-50 px-1 py-0.5 rounded">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                placeholder="DELETE"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                className="w-full border border-slate-200 p-3 rounded-xl focus:border-rose-550 outline-none text-xs font-bold uppercase tracking-wider"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteInput('');
                }}
                className="px-5 py-2.5 bg-white border border-slate-200 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteOrder}
                disabled={deleting || deleteInput !== 'DELETE'}
                className="px-5 py-2.5 bg-rose-650 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
              >
                {deleting ? <Loader2 className="animate-spin" size={14} /> : null}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
