'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Download, Loader2, FileText } from 'lucide-react';

interface CustomInvoiceItem {
  title: string;
  price: number;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export default function CustomInvoiceGenerator() {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);

  // Invoice meta
  const [orderNumber, setOrderNumber] = useState(`CUSTOM-${Date.now().toString().slice(-6)}`);
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);

  // Brand info
  const [brandName, setBrandName] = useState('AS SIDRAT');
  const [brandAddress, setBrandAddress] = useState('');
  const [brandPhone, setBrandPhone] = useState('');
  const [brandEmail, setBrandEmail] = useState('');

  // Load brand details default values from site settings on mount
  useEffect(() => {
    const fetchBrandSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.settings) {
            const { contactAddress, whatsappNumber, contactEmail } = data.settings;
            if (contactAddress) setBrandAddress(contactAddress);
            if (whatsappNumber) setBrandPhone(whatsappNumber);
            if (contactEmail) setBrandEmail(contactEmail);
          }
        }
      } catch (err) {
        console.error('Failed to fetch settings for custom invoice pre-populate:', err);
      }
    };
    fetchBrandSettings();
  }, []);

  // Customer
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerCity, setCustomerCity] = useState('');

  // Items
  const [items, setItems] = useState<CustomInvoiceItem[]>([
    { title: '', price: 0, quantity: 1, selectedSize: '', selectedColor: '' },
  ]);

  // Financials
  const [discount, setDiscount] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [paymentStatus, setPaymentStatus] = useState('Pending');
  const [notes, setNotes] = useState('');

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal - discount + shippingFee;

  const addItem = () => {
    setItems(prev => [...prev, { title: '', price: 0, quantity: 1, selectedSize: '', selectedColor: '' }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!customerName || items.some(i => !i.title || i.price <= 0)) {
      return alert('Fill all item names, prices, and customer name');
    }

    setGenerating(true);
    try {
      const payload = {
        orderNumber,
        createdAt: orderDate,
        customerName,
        customerPhone,
        customerEmail,
        customerAddress,
        customerCity,
        items: items.map(i => ({
          title: i.title,
          price: i.price,
          quantity: i.quantity,
          selectedSize: i.selectedSize || undefined,
          selectedColor: i.selectedColor || undefined,
        })),
        subtotal,
        discount,
        shippingFee,
        totalAmount: total,
        paymentMethod,
        paymentStatus,
        notes,
        brandName: brandName || undefined,
        brandAddress: brandAddress || undefined,
        brandPhone: brandPhone || undefined,
        brandEmail: brandEmail || undefined,
      };

      const res = await fetch('/api/invoice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate');
      }

      // Download the PDF
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${orderNumber}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Failed to generate invoice');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Custom Invoice Generator</h1>
          <p className="text-sm text-slate-500 mt-1">Create and download professional PDF invoices without a database record</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left — Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Brand Info */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
              <FileText size={16} className="text-slate-400" /> Brand Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" value={brandName} onChange={e => setBrandName(e.target.value)} placeholder="Brand Name" className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black text-sm" />
              <input type="text" value={brandPhone} onChange={e => setBrandPhone(e.target.value)} placeholder="Brand Phone" className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black text-sm" />
              <input type="text" value={brandAddress} onChange={e => setBrandAddress(e.target.value)} placeholder="Brand Address" className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black text-sm" />
              <input type="email" value={brandEmail} onChange={e => setBrandEmail(e.target.value)} placeholder="Brand Email" className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black text-sm" />
            </div>
          </div>

          {/* Customer */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">Customer Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" required value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Customer Name *" className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black text-sm" />
              <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Phone" className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black text-sm" />
              <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder="Email" className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black text-sm" />
              <input type="text" value={customerCity} onChange={e => setCustomerCity(e.target.value)} placeholder="City" className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black text-sm" />
              <div className="col-span-2">
                <textarea value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} placeholder="Full Address" rows={2} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black text-sm resize-none" />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-slate-800">Invoice Items</h3>
              <button type="button" onClick={addItem} className="text-[10px] font-bold uppercase tracking-wider bg-black text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-all flex items-center gap-1">
                <Plus size={14} /> Add Item
              </button>
            </div>

            {items.map((item, idx) => (
              <div key={idx} className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <input type="text" value={item.title} onChange={e => updateItem(idx, 'title', e.target.value)} placeholder="Item name *" className="flex-1 min-w-[180px] p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-black text-sm" />
                <input type="number" value={item.price} onChange={e => updateItem(idx, 'price', parseFloat(e.target.value) || 0)} placeholder="Price *" className="w-24 p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-black text-sm" />
                <input type="number" value={item.quantity} onChange={e => updateItem(idx, 'quantity', Math.max(1, parseInt(e.target.value) || 1))} min={1} className="w-16 p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-black text-sm" />
                <input type="text" value={item.selectedSize} onChange={e => updateItem(idx, 'selectedSize', e.target.value)} placeholder="Size" className="w-16 p-2.5 bg-white border border-slate-200 rounded-lg outline-none text-sm" />
                <input type="text" value={item.selectedColor} onChange={e => updateItem(idx, 'selectedColor', e.target.value)} placeholder="Color" className="w-20 p-2.5 bg-white border border-slate-200 rounded-lg outline-none text-sm" />
                <span className="text-sm font-bold text-slate-700 w-20 text-right">৳{(item.price * item.quantity).toLocaleString()}</span>
                <button type="button" onClick={() => removeItem(idx)} className="p-2 text-slate-300 hover:text-red-500 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Financials & Payment */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 border-b pb-2">Financials & Payment</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Discount</label>
                <input type="number" value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} className="w-full p-2.5 mt-1 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-black text-sm" />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Shipping Fee</label>
                <input type="number" value={shippingFee} onChange={e => setShippingFee(parseFloat(e.target.value) || 0)} className="w-full p-2.5 mt-1 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-black text-sm" />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Payment Method</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full p-2.5 mt-1 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm cursor-pointer">
                  <option>Cash on Delivery</option>
                  <option>bKash</option>
                  <option>Nagad</option>
                  <option>Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Payment Status</label>
                <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)} className="w-full p-2.5 mt-1 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm cursor-pointer">
                  <option>Pending</option>
                  <option>Paid</option>
                  <option>Partially Paid</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Optional notes to include on invoice" className="w-full p-2.5 mt-1 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-black text-sm resize-none" />
            </div>
          </div>
        </div>

        {/* Right — Summary & Download */}
        <div className="space-y-6 lg:sticky lg:top-24">
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl space-y-5">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Invoice Summary</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-300">Subtotal ({items.length} items)</span>
                <span className="font-bold">৳{subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount</span>
                  <span className="font-bold">-৳{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-300">Shipping</span>
                <span className="font-bold">{shippingFee === 0 ? 'FREE' : `৳${shippingFee.toLocaleString()}`}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-700">
                <span className="text-lg font-black">Total</span>
                <span className="text-lg font-black text-white">৳{total.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2 text-[10px] text-slate-400 space-y-1">
              <p>Order: {orderNumber}</p>
              <p>Date: {orderDate}</p>
              <p>Payment: {paymentMethod} ({paymentStatus})</p>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating || !customerName}
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg mt-4"
            >
              {generating ? (
                <><Loader2 className="animate-spin" size={16} /> Generating...</>
              ) : (
                <><Download size={16} /> Download Invoice PDF</>
              )}
            </button>

            <p className="text-[9px] text-slate-500 text-center">
              This generates a standalone PDF. No database record is created.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
