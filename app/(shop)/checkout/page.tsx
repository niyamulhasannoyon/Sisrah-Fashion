'use client';

import { useCartStore } from '@/store/useCartStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, ShieldCheck, Truck, CreditCard, Banknote, MapPin } from 'lucide-react';

export default function CheckoutPage() {
  const { cart, getCartTotal, clearCart } = useCartStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [shippingInfo, setShippingInfo] = useState({ name: '', phone: '', address: '', city: '' });
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');

  const applyCoupon = async () => {
    setCouponError('');
    if (!couponCode) return;
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, totalAmount: getCartTotal() }),
      });
      const data = await res.json();
      if (data.success) {
        setAppliedCoupon(data.coupon);
      } else {
        setCouponError(data.message);
        setAppliedCoupon(null);
      }
    } catch (error) {
      setCouponError('Error validating coupon');
    }
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === 'Percentage') {
      return (getCartTotal() * appliedCoupon.discountValue) / 100;
    }
    return appliedCoupon.discountValue;
  };

  const finalTotal = getCartTotal() - calculateDiscount();

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (paymentMethod !== 'Cash on Delivery') {
      alert("Online payment is being integrated. Please use Cash on Delivery.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shippingInfo, orderItems: cart, totalAmount: finalTotal, paymentMethod, couponCode: appliedCoupon?.code }),
      });
      const data = await res.json();
      if (data.success) {
        clearCart();
        router.push(`/order-success?id=${data.orderId}`);
      }
    } catch (error) {
      alert('Order failed!');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="bg-[#FBFBFB] min-h-screen pb-20">
      <div className="container mx-auto px-4 pt-10">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-[#1A1A1A] mb-10 text-center lg:text-left">
          Secure Checkout <span className="text-[#A31F24]">.</span>
        </h1>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          
          {/* Left: Forms */}
          <div className="w-full lg:w-[65%] flex flex-col gap-6">
            
            <form onSubmit={handlePlaceOrder} id="checkout-form" className="space-y-6">
              
              {/* Shipping Card */}
              <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <h2 className="text-lg font-bold uppercase tracking-tight">Shipping Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">Recipient Name</label>
                    <input type="text" placeholder="e.g. Niyamul Hasan" required 
                      className="w-full border border-gray-200 p-3.5 rounded-lg focus:border-black outline-none transition-all bg-gray-50/50 focus:bg-white" 
                      onChange={(e) => setShippingInfo({...shippingInfo, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">Phone Number</label>
                    <input type="tel" placeholder="017XXXXXXXX" required 
                      className="w-full border border-gray-200 p-3.5 rounded-lg focus:border-black outline-none transition-all bg-gray-50/50 focus:bg-white" 
                      onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})} />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">Delivery Address</label>
                    <textarea placeholder="House, Road, Area details..." rows={3} required 
                      className="w-full border border-gray-200 p-3.5 rounded-lg focus:border-black outline-none transition-all bg-gray-50/50 focus:bg-white resize-none" 
                      onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">City / District</label>
                    <input type="text" placeholder="e.g. Dhaka" required 
                      className="w-full border border-gray-200 p-3.5 rounded-lg focus:border-black outline-none transition-all bg-gray-50/50 focus:bg-white" 
                      onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Payment Card */}
              <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <h2 className="text-lg font-bold uppercase tracking-tight">Payment Method</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className={`relative flex items-center gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'Cash on Delivery' ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}>
                    <input type="radio" name="payment" value="Cash on Delivery" checked={paymentMethod === 'Cash on Delivery'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 accent-black" />
                    <div className="flex items-center gap-3">
                      <Banknote className={paymentMethod === 'Cash on Delivery' ? 'text-black' : 'text-gray-400'} />
                      <span className="font-bold text-sm">Cash on Delivery</span>
                    </div>
                  </label>

                  <label className={`relative flex items-center gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'SSLCommerz' ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200 opacity-60'}`}>
                    <input type="radio" name="payment" value="SSLCommerz" checked={paymentMethod === 'SSLCommerz'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 accent-black" />
                    <div className="flex items-center gap-3">
                      <CreditCard className="text-gray-400" />
                      <div>
                        <p className="font-bold text-sm">Online Payment</p>
                        <p className="text-[10px] text-gray-500 uppercase font-bold">bKash, Cards, Rocket</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </form>
          </div>

          {/* Right: Summary Sidebar */}
          <div className="w-full lg:w-[35%] lg:sticky lg:top-24">
            <div className="bg-[#1A1A1A] text-white p-8 rounded-2xl shadow-xl">
              <h2 className="text-lg font-bold uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white/90 line-clamp-1">{item.title}</span>
                      <span className="text-[10px] uppercase text-white/40 font-bold tracking-tighter">
                        {item.selectedSize} / {item.selectedColor} × {item.quantity}
                      </span>
                    </div>
                    <span className="text-sm font-bold">৳{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Promo Code Section */}
              <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="PROMO CODE" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 bg-transparent border border-white/20 p-2.5 rounded text-xs outline-none focus:border-white uppercase transition-all"
                  />
                  <button type="button" onClick={applyCoupon} className="bg-white text-black px-4 py-2 text-[10px] font-black rounded hover:bg-[#A31F24] hover:text-white transition-all">
                    APPLY
                  </button>
                </div>
                {couponError && <p className="text-red-500 text-[10px] mt-2 font-bold">{couponError}</p>}
                {appliedCoupon && (
                   <div className="flex justify-between items-center mt-2">
                     <p className="text-green-400 text-[10px] font-bold italic">Coupon "{appliedCoupon.code}" Applied!</p>
                     <button onClick={() => setAppliedCoupon(null)} className="text-[10px] text-white/40 hover:text-white underline">Remove</button>
                   </div>
                )}
              </div>

              <div className="space-y-3 border-t border-white/10 pt-6">
                <div className="flex justify-between text-sm text-white/60">
                  <span>Subtotal</span>
                  <span>৳{getCartTotal().toLocaleString()}</span>
                </div>
                {appliedCoupon && (
                   <div className="flex justify-between text-sm text-green-400 font-bold">
                     <span>Discount</span>
                     <span>- ৳{calculateDiscount().toLocaleString()}</span>
                   </div>
                )}
                <div className="flex justify-between text-sm text-white/60">
                  <span>Shipping</span>
                  <span className="text-green-400 font-bold uppercase text-[10px]">Calculated at next step</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                  <span className="text-lg font-black uppercase tracking-tighter">Grand Total</span>
                  <span className="text-2xl font-black text-[#A31F24]">৳{finalTotal.toLocaleString()}</span>
                </div>
              </div>

              <button 
                form="checkout-form"
                type="submit" 
                disabled={loading} 
                className="w-full bg-white text-black py-5 mt-8 font-black uppercase tracking-widest text-sm rounded-xl hover:bg-[#A31F24] hover:text-white transition-all duration-500 flex justify-center items-center gap-2 group shadow-lg"
              >
                {loading ? <Loader2 className="animate-spin" /> : (
                  <>
                    Confirm Order <ShieldCheck size={18} className="group-hover:scale-110 transition-transform" />
                  </>
                )}
              </button>

              <div className="mt-6 flex items-center justify-center gap-4 opacity-40 grayscale">
                 <Truck size={16} />
                 <ShieldCheck size={16} />
                 <MapPin size={16} />
              </div>
            </div>
            
            <p className="text-[10px] text-gray-400 text-center mt-4 font-bold uppercase tracking-widest">
              Guaranteed Safe & Secure Checkout
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
