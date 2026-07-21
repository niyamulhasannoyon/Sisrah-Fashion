'use client';

import { useCartStore } from '@/store/useCartStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, ShieldCheck, Truck, CreditCard, Banknote, MapPin, ShoppingCart, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const districts = [
  'Dhaka', 'Bagerhat', 'Bandarban', 'Barguna', 'Barisal', 'Bhola', 'Bogra', 'Brahmanbaria', 'Chandpur', 'Chapainawabganj', 'Chittagong', 'Chuadanga', 'Comilla', "Cox's Bazar", 'Dinajpur', 'Faridpur', 'Feni', 'Gaibandha', 'Gazipur', 'Gopalganj', 'Habiganj', 'Jamalpur', 'Jessore', 'Jhalokati', 'Jhenaidah', 'Joypurhat', 'Khagrachari', 'Khulna', 'Kishoreganj', 'Kurigram', 'Kushtia', 'Lakshmipur', 'Lalmonirhat', 'Madaripur', 'Magura', 'Manikganj', 'Maulvibazar', 'Meherpur', 'Munshiganj', 'Mymensingh', 'Naogaon', 'Narail', 'Narayanganj', 'Narsingdi', 'Natore', 'Netrokona', 'Nilphamari', 'Noakhali', 'Pabna', 'Panchagarh', 'Patuakhali', 'Pirojpur', 'Rajbari', 'Rajshahi', 'Rangamati', 'Rangpur', 'Satkhira', 'Shariatpur', 'Sherpur', 'Sirajganj', 'Sunamganj', 'Sylhet', 'Tangail', 'Thakurgaon'
];

const isValidBDPhone = (phone: string) => {
  const bdPhoneRegex = /^(?:\+88)?01[3-9]\d{8}$/;
  return bdPhoneRegex.test(phone.trim());
};

export default function CheckoutPage() {
  const { cart, getCartTotal, clearCart } = useCartStore();
  const { settings, fetchSettings } = useSettingsStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);

  const [shippingInfo, setShippingInfo] = useState({ name: '', phone: '', email: '', address: '', city: '' });
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [txnId, setTxnId] = useState('');
  const [txnIdError, setTxnIdError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [showMobileSummary, setShowMobileSummary] = useState(false);

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
        email: prev.email || user.email || '',
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
    setPhoneError('');
    setTxnIdError('');
    setPaidAmountError('');

    if (!isValidBDPhone(shippingInfo.phone)) {
      setPhoneError("Please enter a valid 11-digit phone number (e.g. 017XXXXXXXX)");
      setLoading(false);
      return;
    }

    let parsedPaidAmount = finalTotal;
    const isMobilePayment = paymentMethod === 'bKash' || paymentMethod === 'Nagad';

    if (isMobilePayment) {
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
      const minAdvancePayment = settings?.freeShippingMinAmount ? Math.min(200, settings.freeShippingMinAmount * 0.1) : 200;
      if (amt < minAdvancePayment) {
        setPaidAmountError(`Minimum advance payment is ৳${minAdvancePayment}`);
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
      // Read campaign slug from sessionStorage (set by landing pages for order attribution)
      const campaignSlug = (() => {
        try { return sessionStorage.getItem('loomra_campaign_slug') || undefined; } catch { return undefined; }
      })();

      const orderPayload = {
        shippingInfo,
        orderItems: cart,
        totalAmount: finalTotal,
        paymentMethod,
        paymentStatus: 'Pending',
        transactionId: isMobilePayment ? txnId : undefined,
        paidAmount: isMobilePayment ? parsedPaidAmount : undefined,
        couponCode: appliedCoupon?.code,
        couponDiscount: calculateDiscount(),
        campaignSlug,
      };

      // Clear campaign attribution after order placement
      try { sessionStorage.removeItem('loomra_campaign_slug'); } catch {}

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });
      const data = await res.json();
      if (data.success) {
        clearCart();
        localStorage.setItem('loomra_latest_order_id', data.orderId.toString());
        localStorage.setItem('loomra_latest_order_phone', data.phone);
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
          <button onClick={() => router.push('/shop')}              className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-[#A31F24] active:scale-[0.97] transition-all">
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F6F3] min-h-screen pb-[max(6rem,env(safe-area-inset-bottom))] font-sans overflow-x-hidden">
      <div className="mx-auto px-4 pt-6 sm:px-6 lg:px-8 max-w-7xl">
        <div className="max-w-7xl mx-auto">
          {/* ── Compact Header ── */}
          <div className="flex items-center gap-3 mb-8 lg:mb-12">
            <button 
              onClick={() => router.back()} 
              className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white hover:border-black active:scale-95 transition-all group bg-white/80"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-gray-900 leading-none">
                Checkout<span className="text-[#A31F24]">.</span>
              </h1>
              <p className="text-[9px] sm:text-xs text-gray-500 font-bold uppercase tracking-[0.15em] mt-0.5">Secure Transaction &amp; Express Delivery</p>
            </div>
          </div>

          {/* ── Mobile Order Summary Accordion (Premium Light) ── */}
          <div className="lg:hidden w-full bg-white border border-gray-200 rounded-2xl mb-8 shadow-sm transition-all overflow-hidden">
            <button
              type="button"
              onClick={() => setShowMobileSummary(!showMobileSummary)}
              className="flex justify-between items-center w-full px-5 py-4 bg-white focus:outline-none"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
                  <ShoppingCart size={14} className="text-gray-700" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-500 block leading-none">
                    {showMobileSummary ? 'Hide' : 'Show'} Order Summary
                  </span>
                  <span className="text-[9px] font-bold text-gray-400 mt-0.5 block">
                    {cart.reduce((acc, item) => acc + item.quantity, 0)} items
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-gray-900">৳ {finalTotal.toLocaleString()}</span>
                <div className={`w-6 h-6 rounded-lg border border-gray-200 flex items-center justify-center transition-all duration-300 ${showMobileSummary ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500'}`}>
                  <svg
                    className={`w-3 h-3 transition-transform duration-300 ${showMobileSummary ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </button>

            <AnimatePresence>
              {showMobileSummary && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden border-t border-gray-100"
                >
                  <div className="px-5 py-5 flex flex-col gap-5 bg-gray-50/50">
                    {/* ── Cart Items ── */}
                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                      {cart.map((item, idx) => (
                        <div key={idx} className="flex gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                          <div className="w-14 h-[60px] bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-50">
                            <img src={item.image} alt={item.title} width="56" height="60" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                            <div className="flex justify-between items-start gap-1">
                              <h4 className="text-xs font-bold text-gray-900 truncate">{item.title}</h4>
                              <span className="text-xs font-black text-gray-900 shrink-0">৳{(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                            <p className="text-[9px] uppercase text-gray-400 font-bold tracking-wider">
                              {item.selectedSize} / {item.selectedColor}
                              <span className="ml-1.5 text-gray-300">| Qty: {item.quantity}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* ── Coupon Code ── */}
                    <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="PROMO CODE"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="flex-1 bg-gray-50 border border-gray-200 px-3 py-2.5 rounded-lg text-[10px] font-bold outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 uppercase transition-all placeholder:text-gray-300"
                        />
                        <button
                          type="button"
                          onClick={applyCoupon}
                          className="bg-gray-900 text-white px-4 py-2.5 text-[10px] font-black rounded-lg hover:bg-[#A31F24] transition-all active:scale-95 shadow-sm"
                        >
                          Apply
                        </button>
                      </div>
                      {couponError && <p className="text-red-500 text-[9px] mt-2 font-bold uppercase tracking-wider text-center">{couponError}</p>}
                      {appliedCoupon && (
                        <div className="flex justify-between items-center mt-2.5 px-0.5">
                          <p className="text-emerald-600 text-[9px] font-black italic uppercase tracking-wider">Saved ৳{calculateDiscount().toLocaleString()}</p>
                          <button onClick={() => setAppliedCoupon(null)} className="text-[9px] text-gray-400 hover:text-red-500 underline font-bold uppercase transition-colors">Remove</button>
                        </div>
                      )}
                    </div>

                    {/* ── Totals ── */}
                    <div className="space-y-2.5 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                      <div className="flex justify-between text-[10px] font-bold text-gray-500">
                        <span>Subtotal</span>
                        <span className="text-gray-900">৳{getCartTotal().toLocaleString()}</span>
                      </div>
                      {appliedCoupon && (
                        <div className="flex justify-between text-[10px] font-bold text-emerald-600">
                          <span>Discount</span>
                          <span>- ৳{calculateDiscount().toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-[10px] font-bold text-gray-500">
                        <span>Shipping</span>
                        <span className={isShippingFree() || (getShippingCost() === 0 && !shippingInfo.city) ? 'text-emerald-600 italic' : 'text-gray-900'}>
                          {isShippingFree() ? 'FREE' : !shippingInfo.city ? 'Enter city' : `৳${getShippingCost().toLocaleString()}`}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-3 mt-1 border-t border-gray-100">
                        <span className="text-sm font-black text-gray-900 uppercase tracking-tight">Total</span>
                        <span className="text-lg font-black text-gray-900">৳{finalTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 items-start">
            
            {/* Left Column: Form Steps */}
            <div className="w-full lg:w-[62%] space-y-8">
              
              <form onSubmit={handlePlaceOrder} id="checkout-form" className="space-y-8">
                
                {/* ── Step 1: Shipping Details ── */}
                <div className="bg-white p-5 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center text-xs font-black shadow-sm shrink-0">1</div>
                      <div>
                        <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-gray-900 leading-tight">Shipping Details</h2>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em]">Where should we send your order?</p>
                      </div>
                    </div>
                    <MapPin size={18} className="text-gray-200 shrink-0" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-gray-500 tracking-[0.1em]">Full Name</label>
                      <input type="text" placeholder="e.g. Niyamul Hasan" required 
                        value={shippingInfo.name}
                        className="w-full border border-gray-200 px-3.5 py-2.5 rounded-lg focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 outline-none transition-all bg-white text-sm font-medium placeholder:text-gray-300" 
                        onChange={(e) => setShippingInfo({...shippingInfo, name: e.target.value})} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-gray-500 tracking-[0.1em]">Phone Number</label>
                      <input type="tel" placeholder="017XXXXXXXX" required 
                        value={shippingInfo.phone}
                        className={`w-full border px-3.5 py-2.5 rounded-lg focus:ring-1 outline-none transition-all bg-white text-sm font-medium placeholder:text-gray-300 ${
                          phoneError 
                            ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-red-500/10' 
                            : 'border-gray-200 focus:border-gray-900 focus:ring-gray-900/10'
                        }`} 
                        onChange={(e) => {
                          setShippingInfo({...shippingInfo, phone: e.target.value});
                          if (phoneError) setPhoneError('');
                        }} />
                      {phoneError && (
                        <p className="text-red-500 text-[9px] font-bold uppercase tracking-wider">{phoneError}</p>
                      )}
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-gray-500 tracking-[0.1em]">Complete Address</label>
                      <textarea placeholder="House #, Road #, Area..." rows={2} required 
                        value={shippingInfo.address}
                        className="w-full border border-gray-200 px-3.5 py-2.5 rounded-lg focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 outline-none transition-all bg-white text-sm font-medium resize-none placeholder:text-gray-300" 
                        onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-gray-500 tracking-[0.1em]">
                        Email <span className="font-normal lowercase tracking-normal text-gray-400">(for invoice)</span>
                      </label>
                      <input type="email" placeholder="your@email.com" 
                        value={shippingInfo.email}
                        className="w-full border border-gray-200 px-3.5 py-2.5 rounded-lg focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 outline-none transition-all bg-white text-sm font-medium placeholder:text-gray-300" 
                        onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-gray-500 tracking-[0.1em]">City / District</label>
                      <select required 
                        value={shippingInfo.city}
                        className="w-full border border-gray-200 px-3.5 py-2.5 rounded-lg focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 outline-none transition-all bg-white text-sm font-medium cursor-pointer" 
                        onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                      >
                        <option value="" disabled>Select City / District</option>
                        {districts.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* ── Step 2: Payment Gateway ── */}
                <div className="bg-white p-5 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center text-xs font-black shadow-sm shrink-0">2</div>
                      <div>
                        <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-gray-900 leading-tight">Payment Gateway</h2>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em]">Choose your preferred payment mode</p>
                      </div>
                    </div>
                    <CreditCard size={18} className="text-gray-200 shrink-0" />
                  </div>

                  {/* ── Premium Payment Method Cards ── */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Cash on Delivery */}
                    <label className={`relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      paymentMethod === 'Cash on Delivery'
                        ? 'border-gray-900 bg-gray-50 shadow-sm'
                        : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                    }`}>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        paymentMethod === 'Cash on Delivery' ? 'border-gray-900' : 'border-gray-300'
                      }`}>
                        {paymentMethod === 'Cash on Delivery' && <div className="w-2 h-2 bg-gray-900 rounded-full" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-xs font-black uppercase tracking-tight block leading-tight ${
                          paymentMethod === 'Cash on Delivery' ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          Cash on Delivery
                        </span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Pay when you receive</span>
                      </div>
                      <Banknote size={20} className={paymentMethod === 'Cash on Delivery' ? 'text-gray-900' : 'text-gray-300'} />
                      <input type="radio" name="payment" value="Cash on Delivery" checked={paymentMethod === 'Cash on Delivery'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                    </label>

                    {/* bKash */}
                    <label className={`relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      paymentMethod === 'bKash'
                        ? 'border-gray-900 bg-gray-50 shadow-sm'
                        : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                    }`}>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        paymentMethod === 'bKash' ? 'border-gray-900' : 'border-gray-300'
                      }`}>
                        {paymentMethod === 'bKash' && <div className="w-2 h-2 bg-gray-900 rounded-full" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-xs font-black uppercase tracking-tight block leading-tight ${
                          paymentMethod === 'bKash' ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          bKash
                        </span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Pay via bKash MFS</span>
                      </div>
                      <div className={`w-8 h-5 rounded flex items-center justify-center text-[8px] font-black select-none shrink-0 ${
                        paymentMethod === 'bKash' ? 'bg-[#E2125B] text-white' : 'bg-gray-100 text-gray-400'
                      }`}>
                        bKash
                      </div>
                      <input type="radio" name="payment" value="bKash" checked={paymentMethod === 'bKash'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                    </label>

                    {/* Nagad */}
                    <label className={`relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      paymentMethod === 'Nagad'
                        ? 'border-gray-900 bg-gray-50 shadow-sm'
                        : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                    }`}>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        paymentMethod === 'Nagad' ? 'border-gray-900' : 'border-gray-300'
                      }`}>
                        {paymentMethod === 'Nagad' && <div className="w-2 h-2 bg-gray-900 rounded-full" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-xs font-black uppercase tracking-tight block leading-tight ${
                          paymentMethod === 'Nagad' ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          Nagad
                        </span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Pay via Nagad MFS</span>
                      </div>
                      <div className={`w-8 h-5 rounded flex items-center justify-center text-[8px] font-black select-none shrink-0 ${
                        paymentMethod === 'Nagad' ? 'bg-[#F15A22] text-white' : 'bg-gray-100 text-gray-400'
                      }`}>
                        নগদ
                      </div>
                      <input type="radio" name="payment" value="Nagad" checked={paymentMethod === 'Nagad'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                    </label>

                    {/* Due (Baki) */}
                    <label className={`relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      paymentMethod === 'Due (Baki)'
                        ? 'border-gray-900 bg-gray-50 shadow-sm'
                        : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                    }`}>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        paymentMethod === 'Due (Baki)' ? 'border-gray-900' : 'border-gray-300'
                      }`}>
                        {paymentMethod === 'Due (Baki)' && <div className="w-2 h-2 bg-gray-900 rounded-full" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-xs font-black uppercase tracking-tight block leading-tight ${
                          paymentMethod === 'Due (Baki)' ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          Due / Baki
                        </span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Pay Later / Credit</span>
                      </div>
                      <Clock size={20} className={paymentMethod === 'Due (Baki)' ? 'text-gray-900' : 'text-gray-300'} />
                      <input type="radio" name="payment" value="Due (Baki)" checked={paymentMethod === 'Due (Baki)'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                    </label>
                  </div>

                  {/* ── COD Info Block ── */}
                  {paymentMethod === 'Cash on Delivery' && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-start gap-3">
                        <Truck size={16} className="text-gray-500 mt-0.5 shrink-0" />
                        <p className="text-[11px] text-gray-600 leading-relaxed">
                          You will pay <strong className="text-gray-900">৳{finalTotal.toLocaleString()}</strong> in cash when your order arrives.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ── Due Info Block ── */}
                  {paymentMethod === 'Due (Baki)' && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-start gap-3">
                        <Clock size={16} className="text-gray-500 mt-0.5 shrink-0" />
                        <p className="text-[11px] text-gray-600 leading-relaxed">
                          Your order will be processed as <strong className="text-gray-900">Due (বাকি)</strong>. Total of <strong className="text-gray-900">৳{finalTotal.toLocaleString()}</strong> to be paid later.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ── bKash/Nagad Details ── */}
                  {(paymentMethod === 'bKash' || paymentMethod === 'Nagad') && (
                    <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      {/* Payment Number Card */}
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="space-y-2">
                          <p className="text-[9px] font-black uppercase text-gray-400 tracking-[0.15em]">Send Money To</p>
                          <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                            <span className="font-mono text-sm font-bold text-gray-900 tracking-wider">
                              {settings?.paymentNumber || '01733919156'}
                            </span>
                            <span className="text-[8px] font-black uppercase px-2 py-1 rounded bg-gray-100 text-gray-500">
                              {paymentMethod}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500">
                            Send <strong className="text-gray-900">৳{finalTotal.toLocaleString()}</strong> to this number
                          </p>
                        </div>
                      </div>

                      {/* Payment Amount Type */}
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-gray-500 tracking-[0.1em]">Payment Option</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setPaymentAmountType('Full')}
                            className={`py-3 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all ${
                              paymentAmountType === 'Full'
                                ? 'border-gray-900 bg-gray-900 text-white shadow-sm'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
                            }`}
                          >
                            Full Amount
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentAmountType('Partial')}
                            className={`py-3 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all ${
                              paymentAmountType === 'Partial'
                                ? 'border-gray-900 bg-gray-900 text-white shadow-sm'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
                            }`}
                          >
                            Partial
                          </button>
                        </div>
                      </div>

                      {/* Amount Paid */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-gray-500 tracking-[0.1em]">Amount Paid (৳)</label>
                        <input
                          type="number"
                          readOnly={paymentAmountType === 'Full'}
                          placeholder="min ৳200"
                          value={paidAmount}
                          onChange={(e) => {
                            setPaidAmount(e.target.value);
                            if (e.target.value) setPaidAmountError('');
                          }}
                          className={`w-full border px-3.5 py-2.5 rounded-lg outline-none transition-all text-sm font-medium ${
                            paymentAmountType === 'Full'
                              ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                              : 'bg-white focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10 ' + (paidAmountError ? 'border-red-400 bg-red-50/30' : 'border-gray-200')
                          }`}
                        />
                        {paymentAmountType === 'Partial' && (
                          <p className="text-[9px] text-gray-400 font-bold">Min advance: ৳200</p>
                        )}
                        {paidAmountError && (
                          <p className="text-red-500 text-[9px] font-bold uppercase tracking-wider">{paidAmountError}</p>
                        )}
                      </div>

                      {/* Transaction ID */}
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[9px] font-black uppercase text-gray-500 tracking-[0.1em]">Transaction ID (TxnID)</label>
                          <span className="text-[8px] bg-[#A31F24]/10 text-[#A31F24] px-2 py-0.5 rounded font-black uppercase tracking-wider">Required</span>
                        </div>
                        <p className="text-[10px] text-gray-500 leading-relaxed">
                          After sending, copy the TxnID from your bKash/Nagad SMS (e.g. <strong className="text-gray-700">9J88X29K</strong>)
                        </p>
                        <input
                          type="text"
                          placeholder="Paste Transaction ID..."
                          value={txnId}
                          onChange={(e) => {
                            setTxnId(e.target.value.trim());
                            if (e.target.value.trim().length > 0) setTxnIdError('');
                          }}
                          className={`w-full border px-3.5 py-2.5 rounded-lg outline-none transition-all text-sm font-medium bg-white ${
                            txnIdError ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-1 focus:ring-red-500/10' : 'border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10'
                          }`}
                        />
                        {txnIdError && (
                          <p className="text-red-500 text-[9px] font-bold uppercase tracking-wider">{txnIdError}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Mobile Sticky CTA Bar ── */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200/80 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-10px_30px_rgba(0,0,0,0.08)]">
                  <div className="max-w-md mx-auto flex items-center justify-between gap-4">
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none">
                        Total Payable
                      </span>
                      <span className="text-lg font-black text-[#A31F24] mt-1.5 leading-none">
                        ৳{finalTotal.toLocaleString()}
                      </span>
                    </div>
                    
                    <button
                      form="checkout-form"
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-[#A31F24] hover:bg-[#8D181D] active:scale-[0.97] text-white py-3.5 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-0.5 shadow-[0_6px_20px_rgba(163,31,36,0.3)] font-sans"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2 py-0.5">
                          <Loader2 size={14} className="animate-spin" />
                          <span className="text-xs font-black uppercase tracking-wider">Processing...</span>
                        </div>
                      ) : (
                        <>
                          <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider leading-none">
                            <ShieldCheck size={14} className="shrink-0" />
                            {paymentMethod === 'bKash' || paymentMethod === 'Nagad' ? 'Confirm Order' : 'Place My Order'}
                          </span>
                          <span className="text-[9px] font-bold text-white/80 lowercase tracking-wide font-bengali leading-none mt-0.5">
                            {paymentMethod === 'Cash on Delivery' ? 'হাতে পেয়ে মূল্য দিন' : 'নিরাপদ পেমেন্ট (SSL)'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Right Column: Sticky Summary (Hidden on Mobile) */}
            <div className="hidden lg:block w-full lg:w-[38%] lg:sticky lg:top-24">
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
                        <img src={item.image} alt={item.title} width="64" height="80" className="w-full h-full object-cover" />
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
                  className="w-full bg-[#A31F24] hover:bg-[#8D181D] active:scale-[0.98] text-white py-5 mt-10 font-black uppercase transition-all duration-300 flex flex-col justify-center items-center gap-0.5 group shadow-[0_10px_30px_rgba(163,31,36,0.35)] disabled:opacity-50 disabled:cursor-not-allowed rounded-[20px] relative overflow-hidden"
                >
                  {loading ? (
                    <div className="flex items-center gap-2.5 py-1">
                      <Loader2 className="animate-spin" size={18} />
                      <span className="text-xs font-black tracking-[0.1em] uppercase">Processing Order...</span>
                    </div>
                  ) : (
                    <>
                      <span className="flex items-center gap-2 text-sm font-black tracking-[0.15em] leading-none">
                        {(paymentMethod === 'bKash' || paymentMethod === 'Nagad') ? 'Verify & Confirm Order' : 'Place My Order'}
                        <ShieldCheck size={18} className="group-hover:scale-110 transition-transform duration-300 shrink-0" />
                      </span>
                      <span className="text-[10px] font-bold text-white/70 lowercase tracking-wide font-bengali leading-none mt-1">
                        {paymentMethod === 'Cash on Delivery' ? 'হাতে পেয়ে মূল্য দিন (Cash on Delivery)' : 'নিরাপদ পেমেন্ট (Secure Checkout)'}
                      </span>
                    </>
                  )}
                </button>

                {/* Secure Payment Badges */}
                <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center gap-3">
                  <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Guaranteed Safe Checkout</span>
                  <div className="flex justify-center items-center gap-3.5 flex-wrap">
                    {/* bKash Badge */}
                    <div className="h-6 w-11 bg-[#E2125B] rounded-md flex items-center justify-center shadow-md select-none border border-[#E2125B]/20">
                      <span className="text-[9px] text-white font-black italic">bKash</span>
                    </div>
                    {/* Nagad Badge */}
                    <div className="h-6 w-11 bg-[#F15A22] rounded-md flex items-center justify-center shadow-md select-none border border-[#F15A22]/20">
                      <span className="text-[9px] text-white font-black italic">নগদ</span>
                    </div>
                    {/* Visa Badge */}
                    <div className="h-6 w-11 bg-[#1A1F71] rounded-md flex items-center justify-center shadow-md select-none border border-[#1A1F71]/20">
                      <span className="text-[9px] text-white font-black tracking-wide">VISA</span>
                    </div>
                    {/* Mastercard Badge */}
                    <div className="h-6 w-11 bg-[#222222] rounded-md flex items-center justify-center gap-0.5 shadow-md select-none border border-[#222222]/20">
                      <div className="w-2 h-2 bg-[#EB001B] rounded-full"></div>
                      <div className="w-2 h-2 bg-[#FF5F00] rounded-full -ml-1.5 mix-blend-screen"></div>
                    </div>
                    {/* SSLCommerz Badge */}
                    <div className="h-6 w-20 bg-white/10 rounded-md flex items-center justify-center shadow-md select-none border border-white/15">
                      <span className="text-[8px] text-white/80 font-black uppercase tracking-wider">SSLCommerz</span>
                    </div>
                  </div>
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
