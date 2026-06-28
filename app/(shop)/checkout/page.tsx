'use client';

import { useCartStore } from '@/store/useCartStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, ShieldCheck, Truck, CreditCard, Banknote, MapPin, ShoppingCart } from 'lucide-react';

export default function CheckoutPage() {
  const { cart, getCartTotal, clearCart } = useCartStore();
  const { settings, fetchSettings } = useSettingsStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);

  const [shippingInfo, setShippingInfo] = useState({ name: '', phone: '', address: '', city: '' });
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [txnId, setTxnId] = useState('');
  const [txnIdError, setTxnIdError] = useState('');

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    setIsClient(true);
    if (!settings) {
      fetchSettings();
    }
  }, [settings, fetchSettings]);

  useEffect(() => {
    if (user) {
      setShippingInfo(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        phone: prev.phone || user.phone || '',
        address: prev.address || user.address?.street || '',
        city: prev.city || user.address?.city || '',
      }));
    }
  }, [user]);

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

  const getCartItemsCount = () => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  };

  const isShippingFree = () => {
    if (!settings) return false;
    const trigger = settings.freeShippingTrigger;
    if (trigger === 'quantity') {
      const minQty = settings.freeShippingMinQuantity ?? 2;
      return getCartItemsCount() >= minQty;
    }
    if (trigger === 'amount') {
      const minAmount = settings.freeShippingMinAmount ?? 3000;
      return getCartTotal() >= minAmount;
    }
    return false;
  };

  const getShippingCost = () => {
    if (isShippingFree()) return 0;
    if (!shippingInfo.city) return 0;
    const isDhaka = shippingInfo.city.toLowerCase().includes('dhaka');
    if (isDhaka) {
      return settings?.shippingInsideDhaka ?? 60;
    }
    return settings?.shippingOutsideDhaka ?? 120;
  };

  const finalTotal = getCartTotal() - calculateDiscount() + getShippingCost();

  const [paymentAmountType, setPaymentAmountType] = useState('Full');
  const [paidAmount, setPaidAmount] = useState('');
  const [paidAmountError, setPaidAmountError] = useState('');

  // Sync paidAmount if Full Payment is selected
  useEffect(() => {
    if (paymentAmountType === 'Full') {
      setPaidAmount(finalTotal.toString());
      setPaidAmountError('');
    }
  }, [paymentAmountType, finalTotal]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTxnIdError('');
    setPaidAmountError('');

    let parsedPaidAmount = finalTotal;

    if (paymentMethod === 'Mobile Banking') {
      if (!txnId) {
        setTxnIdError("Please enter your Transaction ID");
        setLoading(false);
        return;
      }
      if (txnId.length <= 6) {
        setTxnIdError("Invalid Transaction ID. It must be at least 7 characters.");
        setLoading(false);
        return;
      }

      const amt = parseFloat(paidAmount);
      if (isNaN(amt) || amt <= 0) {
        setPaidAmountError("Please enter a valid amount");
        setLoading(false);
        return;
      }
      if (amt < 200) {
        setPaidAmountError("Minimum advance payment is ৳200");
        setLoading(false);
        return;
      }
      if (amt > finalTotal) {
        setPaidAmountError("Paid amount cannot exceed the total bill");
        setLoading(false);
        return;
      }
      parsedPaidAmount = amt;
    }

    try {
      const orderPayload = {
        shippingInfo,
        orderItems: cart,
        totalAmount: finalTotal,
        paymentMethod,
        paymentStatus: 'Pending',
        transactionId: paymentMethod === 'Mobile Banking' ? txnId : undefined,
        paidAmount: paymentMethod === 'Mobile Banking' ? parsedPaidAmount : undefined,
        couponCode: appliedCoupon?.code
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });
      const data = await res.json();
      if (data.success) {
        clearCart();
        router.push(`/order-success?id=${data.orderId}&phone=${data.phone}`);
      } else {
        alert('Order failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Order failed!');
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-300" size={40} />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FBFBFB]">
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="text-gray-300" size={40} />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 text-sm mb-8">Add some premium essentials to your cart before checking out.</p>
          <button onClick={() => router.push('/shop')} className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-[#A31F24] transition-all">
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FBFBFB] min-h-screen pb-20 font-sans">
      <div className="container mx-auto px-4 pt-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <button onClick={() => router.back()} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white transition-all group">
              <span className="text-xl group-hover:-translate-x-0.5 transition-transform">←</span>
            </button>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900 leading-none">
                Checkout<span className="text-[#A31F24]">.</span>
              </h1>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Secure Transaction & Express Delivery</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 items-start">
            
            {/* Left Column: Form Steps */}
            <div className="w-full lg:w-[62%] space-y-8">
              
              <form onSubmit={handlePlaceOrder} id="checkout-form" className="space-y-8">
                
                {/* Step 1: Shipping */}
                <div className="bg-white p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="bg-black text-white w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black shadow-lg">1</div>
                      <div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">Shipping Details</h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Where should we send your order?</p>
                      </div>
                    </div>
                    <MapPin className="text-gray-200" size={24} />
                  </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Recipient Full Name</label>
                      <input type="text" placeholder="e.g. Niyamul Hasan" required 
                        value={shippingInfo.name}
                        className="w-full border border-gray-100 p-4 rounded-xl focus:border-black outline-none transition-all bg-gray-50/50 focus:bg-white text-sm font-medium" 
                        onChange={(e) => setShippingInfo({...shippingInfo, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Phone Number (Active)</label>
                      <input type="tel" placeholder="017XXXXXXXX" required 
                        value={shippingInfo.phone}
                        className="w-full border border-gray-100 p-4 rounded-xl focus:border-black outline-none transition-all bg-gray-50/50 focus:bg-white text-sm font-medium" 
                        onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})} />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Complete Address</label>
                      <textarea placeholder="House #, Road #, Apartment, Area..." rows={3} required 
                        value={shippingInfo.address}
                        className="w-full border border-gray-100 p-4 rounded-xl focus:border-black outline-none transition-all bg-gray-50/50 focus:bg-white text-sm font-medium resize-none" 
                        onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">City / District</label>
                      <input type="text" placeholder="e.g. Dhaka" required 
                        value={shippingInfo.city}
                        className="w-full border border-gray-100 p-4 rounded-xl focus:border-black outline-none transition-all bg-gray-50/50 focus:bg-white text-sm font-medium" 
                        onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})} />
                    </div>
                  </div>
                </div>

                {/* Step 2: Payment */}
                <div className="bg-white p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="bg-black text-white w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black shadow-lg">2</div>
                      <div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">Payment Gateway</h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Choose your preferred payment mode</p>
                      </div>
                    </div>
                    <CreditCard className="text-gray-200" size={24} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className={`relative flex items-center justify-between p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${paymentMethod === 'Cash on Delivery' ? 'border-black bg-gray-50 shadow-md' : 'border-gray-50 hover:border-gray-200'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'Cash on Delivery' ? 'border-black' : 'border-gray-300'}`}>
                          {paymentMethod === 'Cash on Delivery' && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-sm uppercase tracking-tight">Cash on Delivery</span>
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Pay when you receive</span>
                        </div>
                      </div>
                      <Banknote className={paymentMethod === 'Cash on Delivery' ? 'text-black' : 'text-gray-300'} size={24} />
                      <input type="radio" name="payment" value="Cash on Delivery" checked={paymentMethod === 'Cash on Delivery'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                    </label>

                    <label className={`relative flex items-center justify-between p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${paymentMethod === 'Mobile Banking' ? 'border-black bg-gray-50 shadow-md' : 'border-gray-50 hover:border-gray-200'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'Mobile Banking' ? 'border-black' : 'border-gray-300'}`}>
                          {paymentMethod === 'Mobile Banking' && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-sm uppercase tracking-tight">Mobile Banking</span>
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Bkash, Nagad, Rocket</span>
                        </div>
                      </div>
                      <CreditCard className={paymentMethod === 'Mobile Banking' ? 'text-black' : 'text-gray-300'} size={24} />
                      <input type="radio" name="payment" value="Mobile Banking" checked={paymentMethod === 'Mobile Banking'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                    </label>
                  </div>

                  {paymentMethod === 'Cash on Delivery' ? (
                    <div className="mt-6 p-5 bg-gray-50 rounded-2xl border border-gray-100/50">
                      <p className="text-xs text-gray-600 leading-relaxed font-medium">
                        You will pay a total of <span className="font-bold text-black">৳{finalTotal.toLocaleString()}</span> in cash when the delivery agent arrives at your address.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-6 p-5 bg-gray-50 rounded-2xl border border-gray-100/50 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Payment Instructions</p>
                        <p className="text-xs text-gray-600 leading-relaxed font-medium">
                          Please Send Money of <span className="font-bold text-black">৳{finalTotal.toLocaleString()}</span> to this number:
                        </p>
                        <div className="bg-white p-3.5 rounded-xl border border-gray-200/60 flex justify-between items-center max-w-sm">
                          <span className="font-mono text-sm font-bold text-black tracking-wider">
                            {settings?.paymentNumber || '01733919156'}
                          </span>
                          <span className="text-[9px] bg-gray-100 px-2 py-0.5 rounded font-black uppercase tracking-widest text-gray-500">
                            Bkash/Nagad/Rocket
                          </span>
                        </div>
                      </div>

                      {/* Payment Amount Type Selection */}
                      <div className="space-y-2 pt-2 border-t border-gray-200/50">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block ml-0.5">Payment Option</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setPaymentAmountType('Full')}
                            className={`p-3.5 rounded-xl border text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all ${
                              paymentAmountType === 'Full'
                                ? 'border-black bg-black text-white shadow-sm'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-350'
                            }`}
                          >
                            Pay Full Amount
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentAmountType('Partial')}
                            className={`p-3.5 rounded-xl border text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all ${
                              paymentAmountType === 'Partial'
                                ? 'border-black bg-black text-white shadow-sm'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-350'
                            }`}
                          >
                            Partial Payment
                          </button>
                        </div>
                      </div>

                      {/* Paid Amount Input Field */}
                      <div className="space-y-2 pt-2 border-t border-gray-200/50">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block ml-0.5">
                          Amount Paid (৳)
                        </label>
                        <input
                          type="number"
                          readOnly={paymentAmountType === 'Full'}
                          placeholder="Enter the amount you sent (min ৳200)..."
                          value={paidAmount}
                          onChange={(e) => {
                            setPaidAmount(e.target.value);
                            if (e.target.value) setPaidAmountError('');
                          }}
                          className={`w-full border p-3.5 rounded-xl outline-none transition-all text-sm font-medium ${
                            paymentAmountType === 'Full' 
                              ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' 
                              : 'bg-white focus:border-black ' + (paidAmountError ? 'border-red-500 bg-red-50/10' : 'border-gray-200')
                          }`}
                        />
                        {paymentAmountType === 'Partial' && (
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider ml-1">
                            * Minimum advance payment is ৳200
                          </p>
                        )}
                        {paidAmountError && (
                          <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest ml-1">{paidAmountError}</p>
                        )}
                      </div>

                      {/* Transaction ID Section with High-Converting Separation */}
                      <div className="space-y-2 pt-5 mt-3 border-t border-gray-200/50">
                        <div className="bg-[#1A1A1A]/[0.02] border border-[#1A1A1A]/[0.06] p-4.5 rounded-2xl space-y-2.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-black uppercase text-slate-800 tracking-wider block">
                              Transaction ID (TxnID)
                            </label>
                            <span className="text-[9px] bg-[#A31F24]/10 text-[#A31F24] px-2 py-0.5 rounded font-black uppercase tracking-widest">
                              Required
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            Tip: After sending the money, copy the Transaction ID (TxnID) from the confirmation SMS you received from bKash/Nagad/Rocket (e.g. 9J88X29K).
                          </p>
                          <input 
                            type="text" 
                            placeholder="Enter the 8-10 digit TxnID here..." 
                            value={txnId}
                            onChange={(e) => {
                              setTxnId(e.target.value.trim());
                              if (e.target.value.trim().length > 0) setTxnIdError('');
                            }}
                            className={`w-full border p-3.5 rounded-xl focus:bg-white outline-none transition-all text-sm font-medium ${
                              txnIdError ? 'border-red-500 bg-red-50/10' : 'border-gray-200 bg-white focus:border-black'
                            }`}
                          />
                          {txnIdError && (
                            <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest ml-1">{txnIdError}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Right Column: Sticky Summary */}
            <div className="w-full lg:w-[38%] lg:sticky lg:top-24">
              <div className="bg-[#1A1A1A] text-white p-5 sm:p-8 md:p-10 rounded-3xl md:rounded-[40px] shadow-2xl relative overflow-hidden">
                {/* Abstract Background Element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl -mr-16 -mt-16"></div>
                
                <h2 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center justify-between">
                  Order Summary
                  <span className="text-[10px] bg-white/10 px-3 py-1 rounded-full font-bold tracking-widest">
                    {cart.reduce((acc, item) => acc + item.quantity, 0)} Items
                  </span>
                </h2>
                
                <div className="space-y-6 mb-10 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar-white">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-16 h-20 bg-white/5 rounded-xl overflow-hidden shrink-0 border border-white/10">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-bold text-white/90 line-clamp-1 pr-2">{item.title}</h4>
                          <span className="text-sm font-black">৳{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                        <p className="text-[10px] uppercase text-white/40 font-black tracking-widest mt-1">
                          {item.selectedSize} / {item.selectedColor} — Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Code Interface */}
                <div className="mb-8 p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      placeholder="ENTER PROMO CODE" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 bg-white/5 border border-white/10 p-3.5 rounded-xl text-xs font-bold outline-none focus:border-white/40 uppercase transition-all placeholder:text-white/20"
                    />
                    <button type="button" onClick={applyCoupon} className="bg-white text-black px-6 py-3.5 text-[11px] font-black rounded-xl hover:bg-[#A31F24] hover:text-white transition-all shadow-lg active:scale-95">
                      APPLY
                    </button>
                  </div>
                  {couponError && <p className="text-red-400 text-[10px] mt-3 font-bold uppercase tracking-widest text-center">{couponError}</p>}
                  {appliedCoupon && (
                     <div className="flex justify-between items-center mt-3 px-1">
                       <p className="text-green-400 text-[10px] font-black italic uppercase tracking-widest">SAVED ৳{calculateDiscount().toLocaleString()}</p>
                       <button onClick={() => setAppliedCoupon(null)} className="text-[10px] text-white/30 hover:text-white underline font-bold uppercase">Remove</button>
                     </div>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-4 border-t border-white/10 pt-8">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-white/40">
                    <span>Subtotal</span>
                    <span className="text-white">৳{getCartTotal().toLocaleString()}</span>
                  </div>
                  {appliedCoupon && (
                     <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-green-400">
                       <span>Discount</span>
                       <span>- ৳{calculateDiscount().toLocaleString()}</span>
                     </div>
                  )}
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-white/40">
                    <span>Shipping</span>
                    <span className={isShippingFree() || (getShippingCost() === 0 && !shippingInfo.city) ? "text-green-400 italic font-bold" : "text-white"}>
                      {isShippingFree() ? "FREE" : !shippingInfo.city ? "Enter city for rate" : `৳${getShippingCost().toLocaleString()}`}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-6 mt-4 border-t border-white/10">
                    <div>
                      <span className="text-2xl font-black uppercase tracking-tighter leading-none block">Total</span>
                      <span className="text-[10px] text-white/30 font-bold uppercase tracking-[4px]">Vat Included</span>
                    </div>
                    <div className="text-right">
                      <span className="text-4xl font-black text-white tracking-tighter block">৳{finalTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <button 
                  form="checkout-form"
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-white text-black py-6 mt-10 font-black uppercase tracking-[0.2em] text-sm rounded-[24px] hover:bg-[#A31F24] hover:text-white transition-all duration-700 flex justify-center items-center gap-3 group shadow-[0_15px_40px_rgba(255,255,255,0.1)] active:scale-[0.98]"
                >
                  {loading ? <Loader2 className="animate-spin" /> : (
                    <>
                      {paymentMethod === 'Mobile Banking' ? 'Verify & Confirm Order' : 'Place My Order'} <ShieldCheck size={20} className="group-hover:scale-125 transition-transform duration-500" />
                    </>
                  )}
                </button>

                <div className="mt-8 flex items-center justify-center gap-6 opacity-20 grayscale">
                   <Truck size={20} />
                   <ShieldCheck size={20} />
                   <MapPin size={20} />
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-center gap-2">
                <ShieldCheck size={14} className="text-green-500" />
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                  100% Encrypted & Secure Connection
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
