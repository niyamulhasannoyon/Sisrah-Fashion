'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2, Plus, Trash2, Search, User, MapPin, CreditCard,
  Truck, Tag, FileText, Save, ArrowLeft
} from 'lucide-react';

interface ManualOrderItem {
  productId?: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  selectedSize: string;
  selectedColor: string;
}

export default function ManualOrderPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [showProductPicker, setShowProductPicker] = useState(false);

  // Customer fields
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '', address: '', city: '' });

  // Order items
  const [items, setItems] = useState<ManualOrderItem[]>([]);

  // Financials
  const [discount, setDiscount] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);

  // Payment overrides
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [paymentStatus, setPaymentStatus] = useState('Pending');
  const [orderStatus, setOrderStatus] = useState('Pending');
  const [transactionId, setTransactionId] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [couponCode, setCouponCode] = useState('');

  // Load products for search
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.success) setProducts(data.products);
      })
      .catch(console.error);
  }, []);

  const filteredProducts = products.filter((p: any) =>
    p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category?.toLowerCase().includes(productSearch.toLowerCase())
  ).slice(0, 8);

  const addProduct = (product: any) => {
    const defaultVariant = product.variants?.[0];
    setItems(prev => [...prev, {
      productId: product._id,
      title: product.title,
      price: product.offerPrice > 0 ? product.offerPrice : product.basePrice,
      quantity: 1,
      image: product.images?.[0]?.url || '',
      selectedSize: defaultVariant?.size || 'M',
      selectedColor: defaultVariant?.color || 'Standard',
    }]);
    setShowProductPicker(false);
    setProductSearch('');
  };

  const addCustomItem = () => {
    setItems(prev => [...prev, {
      title: '',
      price: 0,
      quantity: 1,
      image: '',
      selectedSize: 'M',
      selectedColor: 'Standard',
    }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal - discount + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return alert('Add at least one item');
    if (!customer.name || !customer.phone || !customer.address || !customer.city) {
      return alert('Fill all customer fields');
    }

    setSubmitting(true);
    try {
      const payload = {
        customer,
        items: items.map(item => ({
          productId: item.productId,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
        })),
        discount,
        shippingFee,
        paymentMethod,
        paymentStatus,
        orderStatus,
        transactionId: transactionId || undefined,
        paidAmount: paidAmount ? parseFloat(paidAmount) : undefined,
        couponCode: couponCode || undefined,
        internalNotes,
      };

      const res = await fetch('/api/admin/orders/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        alert(`Manual order #${data.orderId} created successfully!`);
        router.push(`/orders/${data._id}`);
      } else {
        alert(data.error || 'Failed to create order');
      }
    } catch (err) {
      alert('Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create Manual Order</h1>
          <p className="text-sm text-slate-500 mt-1">For phone, social media, or offline sales</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex gap-2 mb-8">
        {[
          { num: 1, label: 'Customer', icon: User },
          { num: 2, label: 'Items', icon: Tag },
          { num: 3, label: 'Payment', icon: CreditCard },
          { num: 4, label: 'Review', icon: FileText },
        ].map(s => {
          const Icon = s.icon;
          const isActive = step >= s.num;
          return (
            <button
              key={s.num}
              onClick={() => setStep(s.num)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                isActive
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
              }`}
            >
              <Icon size={14} />
              {s.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Customer Details */}
        {step === 1 && (
          <div className="bg-white p-6 lg:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5 animate-in fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-black text-white w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold">1</div>
              <h2 className="text-lg font-bold text-slate-900">Customer Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Full Name *</label>
                <input type="text" required value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })}
                  placeholder="e.g. Niyamul Hasan"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black focus:bg-white transition-all text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Phone Number *</label>
                <input type="tel" required value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                  placeholder="017XXXXXXXX"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black focus:bg-white transition-all text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Email (optional)</label>
                <input type="email" value={customer.email} onChange={e => setCustomer({ ...customer, email: e.target.value })}
                  placeholder="customer@email.com"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black focus:bg-white transition-all text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">City / District *</label>
                <input type="text" required value={customer.city} onChange={e => setCustomer({ ...customer, city: e.target.value })}
                  placeholder="e.g. Dhaka"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black focus:bg-white transition-all text-sm" />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Full Address *</label>
                <textarea required value={customer.address} onChange={e => setCustomer({ ...customer, address: e.target.value })}
                  placeholder="House #, Road #, Area..."
                  rows={3}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black focus:bg-white transition-all text-sm resize-none" />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button type="button" onClick={() => setStep(2)}
                className="px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all">
                Next — Items
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Order Items */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="bg-white p-6 lg:p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-black text-white w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold">2</div>
                  <h2 className="text-lg font-bold text-slate-900">Order Items</h2>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowProductPicker(true)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 text-[10px] font-bold uppercase rounded-xl hover:bg-slate-200 transition-all flex items-center gap-1.5">
                    <Search size={14} /> Browse Products
                  </button>
                  <button type="button" onClick={addCustomItem}
                    className="px-4 py-2 bg-black text-white text-[10px] font-bold uppercase rounded-xl hover:bg-slate-800 transition-all flex items-center gap-1.5">
                    <Plus size={14} /> Custom Item
                  </button>
                </div>
              </div>

              {/* Product Picker Modal */}
              {showProductPicker && (
                <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex gap-2 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input type="text" placeholder="Search products..." value={productSearch} onChange={e => setProductSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-black text-sm" autoFocus />
                    </div>
                    <button type="button" onClick={() => { setShowProductPicker(false); setProductSearch(''); }}
                      className="px-4 py-2 text-slate-500 text-xs font-bold hover:text-slate-700">Cancel</button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto">
                    {filteredProducts.length === 0 ? (
                      <p className="col-span-full text-sm text-slate-400 italic py-8 text-center">No products found</p>
                    ) : filteredProducts.map((p: any) => (
                      <button key={p._id} type="button" onClick={() => addProduct(p)}
                        className="bg-white p-3 rounded-xl border border-slate-100 hover:border-black hover:shadow-sm transition-all text-left">
                        <p className="text-xs font-bold text-slate-800 truncate">{p.title}</p>
                        <p className="text-[11px] font-black text-[#A31F24] mt-1">
                          ৳ {(p.offerPrice || p.basePrice).toLocaleString()}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Items List */}
              {items.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-400 italic">
                  No items added yet. Search products or add a custom item.
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex-1 min-w-[200px]">
                        <input type="text" value={item.title} onChange={e => updateItem(idx, 'title', e.target.value)}
                          placeholder="Item name"
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-black text-sm font-bold" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20">
                          <input type="number" value={item.price} onChange={e => updateItem(idx, 'price', parseFloat(e.target.value) || 0)}
                            placeholder="Price"
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-black text-sm" />
                        </div>
                        <div className="w-16">
                          <input type="number" value={item.quantity} onChange={e => updateItem(idx, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                            min={1}
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-black text-sm" />
                        </div>
                        <div className="flex gap-1 text-xs">
                          <input type="text" value={item.selectedSize} onChange={e => updateItem(idx, 'selectedSize', e.target.value)}
                            placeholder="Size" className="w-14 p-2 bg-white border border-slate-200 rounded-lg outline-none" />
                          <input type="text" value={item.selectedColor} onChange={e => updateItem(idx, 'selectedColor', e.target.value)}
                            placeholder="Color" className="w-20 p-2 bg-white border border-slate-200 rounded-lg outline-none" />
                        </div>
                        <span className="text-sm font-black text-slate-800 w-20 text-right">
                          ৳{(item.price * item.quantity).toLocaleString()}
                        </span>
                        <button type="button" onClick={() => removeItem(idx)}
                          className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between pt-2">
              <button type="button" onClick={() => setStep(1)}
                className="px-6 py-3 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all">
                Back
              </button>
              <button type="button" onClick={() => setStep(3)}
                className="px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all">
                Next — Payment
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Payment & Overrides */}
        {step === 3 && (
          <div className="bg-white p-6 lg:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5 animate-in fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-black text-white w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold">3</div>
              <h2 className="text-lg font-bold text-slate-900">Payment & Status Overrides</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Payment Method</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black text-sm cursor-pointer">
                  <option>Cash on Delivery</option>
                  <option>bKash</option>
                  <option>Nagad</option>
                  <option>Due (Baki)</option>
                  <option>Bank Transfer</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Payment Status</label>
                <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black text-sm cursor-pointer">
                  <option>Pending</option>
                  <option>Paid</option>
                  <option>Partially Paid</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Order Status</label>
                <select value={orderStatus} onChange={e => setOrderStatus(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black text-sm cursor-pointer">
                  <option>Pending</option>
                  <option>Confirmed</option>
                  <option>Processing</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Discount (৳)</label>
                <input type="number" value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} min={0}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Shipping Fee (৳)</label>
                <input type="number" value={shippingFee} onChange={e => setShippingFee(parseFloat(e.target.value) || 0)} min={0}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Transaction ID</label>
                <input type="text" value={transactionId} onChange={e => setTransactionId(e.target.value)}
                  placeholder="If paid via mobile banking"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Paid Amount (if partial)</label>
                <input type="number" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} min={0}
                  placeholder="Leave empty if unpaid"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Coupon Code</label>
                <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Optional"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black text-sm uppercase" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Internal Notes</label>
                <input type="text" value={internalNotes} onChange={e => setInternalNotes(e.target.value)}
                  placeholder="Admin-only notes"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black text-sm" />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button type="button" onClick={() => setStep(2)}
                className="px-6 py-3 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all">
                Back
              </button>
              <button type="button" onClick={() => setStep(4)}
                className="px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all">
                Review & Create
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white p-6 lg:p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-black text-white w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold">4</div>
                <h2 className="text-lg font-bold text-slate-900">Review Order</h2>
              </div>

              {/* Customer Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-5 bg-slate-50 rounded-2xl">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Customer</p>
                  <p className="font-bold text-slate-900">{customer.name}</p>
                  <p className="text-sm text-slate-600">{customer.phone}</p>
                  {customer.email && <p className="text-sm text-slate-600">{customer.email}</p>}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Shipping</p>
                  <p className="text-sm text-slate-700">{customer.address}</p>
                  <p className="font-bold text-slate-900">{customer.city}</p>
                </div>
              </div>

              {/* Items Summary */}
              <div className="space-y-2 mb-6">
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-50">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{item.title}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">{item.selectedSize} / {item.selectedColor} × {item.quantity}</p>
                    </div>
                    <span className="font-bold text-slate-900">৳{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Financial Summary */}
              <div className="space-y-2 p-5 bg-slate-900 text-white rounded-2xl">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Subtotal ({items.length} items)</span>
                  <span className="font-bold">৳{subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-400">Discount</span>
                    <span className="font-bold text-emerald-400">-৳{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Shipping</span>
                  <span className="font-bold">{shippingFee === 0 ? 'FREE' : `৳${shippingFee.toLocaleString()}`}</span>
                </div>
                <div className="flex justify-between text-lg pt-3 border-t border-slate-700">
                  <span className="font-black">Total</span>
                  <span className="font-black">৳{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="flex flex-wrap gap-4 mt-4 text-xs">
                <span className="px-3 py-1.5 bg-slate-100 rounded-lg font-bold">{paymentMethod}</span>
                <span className="px-3 py-1.5 bg-slate-100 rounded-lg font-bold">Payment: {paymentStatus}</span>
                <span className="px-3 py-1.5 bg-slate-100 rounded-lg font-bold">Status: {orderStatus}</span>
              </div>
            </div>

            <div className="flex justify-between">
              <button type="button" onClick={() => setStep(3)}
                className="px-6 py-3 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all">
                Back
              </button>
              <button type="submit" disabled={submitting}
                className="px-10 py-3.5 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all flex items-center gap-2 disabled:opacity-60 shadow-lg">
                {submitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {submitting ? 'Creating...' : `Create Order — ৳${total.toLocaleString()}`}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
