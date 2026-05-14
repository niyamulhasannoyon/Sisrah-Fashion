'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, Search, Package, Truck, CheckCircle, Clock } from 'lucide-react';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const qId = searchParams.get('id');
    const qPhone = searchParams.get('phone');
    if (qId && qPhone) {
      setOrderId(qId);
      setPhone(qPhone);
      autoTrack(qId, qPhone);
    }
  }, [searchParams]);

  const autoTrack = async (id: string, ph: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id, phone: ph }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, phone }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Processing', 'Send to Courier', 'Shipped', 'Delivered'];
  const currentStepIndex = steps.indexOf(order?.orderStatus || '');

  return (
    <div className="min-h-screen bg-[#FBFBFB] py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black uppercase tracking-tight text-gray-900 mb-4">
            Track Your Order<span className="text-[#A31F24]">.</span>
          </h1>
          <p className="text-gray-500 font-medium">Enter your order details below to see the current status.</p>
        </div>

        {/* Search Form */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 mb-10">
          <form onSubmit={handleTrack} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Order ID (e.g. 100001)</label>
              <input 
                type="text" 
                placeholder="Order ID" 
                required 
                value={orderId}
                onChange={e => setOrderId(e.target.value.toUpperCase())}
                className="w-full border border-gray-100 p-4 rounded-2xl focus:border-black outline-none transition-all bg-gray-50/50 focus:bg-white font-bold" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Phone Number</label>
              <input 
                type="tel" 
                placeholder="017XXXXXXXX" 
                required 
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full border border-gray-100 p-4 rounded-2xl focus:border-black outline-none transition-all bg-gray-50/50 focus:bg-white font-bold" 
              />
            </div>
            <div className="md:col-span-2 pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-[#A31F24] transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/5"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
                {loading ? 'Searching...' : 'Track Now'}
              </button>
            </div>
          </form>
          {error && <p className="text-red-500 text-center text-xs font-bold mt-4 uppercase tracking-widest">{error}</p>}
        </div>

        {/* Tracking Results */}
        {order && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Status Visualizer */}
            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A31F24] mb-1">Current Status</p>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900">{order.orderStatus}</h2>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Order ID</p>
                  <p className="text-xl font-black text-gray-900">#{order.orderId || order._id.slice(-6).toUpperCase()}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative flex justify-between items-center px-4 mb-4">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0" />
                <div 
                  className="absolute top-1/2 left-0 h-1 bg-black -translate-y-1/2 z-0 transition-all duration-1000" 
                  style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                />
                
                {steps.map((step, idx) => (
                  <div key={step} className="relative z-10 flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-4 transition-all duration-500 ${
                      idx <= currentStepIndex ? 'bg-black border-white text-white shadow-xl scale-110' : 'bg-white border-gray-100 text-gray-300'
                    }`}>
                      {step === 'Processing' && <Clock size={20} />}
                      {step === 'Send to Courier' && <Package size={20} />}
                      {step === 'Shipped' && <Truck size={20} />}
                      {step === 'Delivered' && <CheckCircle size={20} />}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest mt-4 ${idx <= currentStepIndex ? 'text-black' : 'text-gray-300'}`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Brief */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-6 border-b pb-4">Package Details</h3>
              <div className="space-y-4">
                {order.orderItems.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <div className="w-12 h-16 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                      <img src={item.images?.[0]?.url || item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.title}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.selectedSize} / {item.selectedColor} — Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-black">৳{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-gray-50 flex justify-between items-center">
                <span className="text-sm font-black uppercase tracking-widest text-gray-400">Total Amount</span>
                <span className="text-2xl font-black text-[#A31F24]">৳{order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Tracking...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
