'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ShieldCheck, RefreshCw, Send, AlertCircle, Clock, Zap } from 'lucide-react';
import { Suspense, useEffect, useState, useCallback } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const phone = searchParams.get('phone');
  const paymentParam = searchParams.get('payment');
  const trxIdParam = searchParams.get('trx_id');
  const statusParam = searchParams.get('status');

  const [orderState, setOrderState] = useState<{
    loading: boolean;
    paymentStatus: string;
    paymentMethod: string;
    transactionId?: string;
    totalAmount?: number;
  }>({
    loading: true,
    paymentStatus: (paymentParam === 'success' || statusParam === 'verified') ? 'Paid' : 'Pending',
    paymentMethod: 'AmaderPay',
    transactionId: trxIdParam || undefined,
  });

  const [trxInput, setTrxInput] = useState('');
  const [submittingTrx, setSubmittingTrx] = useState(false);
  const [trxSuccessMsg, setTrxSuccessMsg] = useState('');
  const [trxErrorMsg, setTrxErrorMsg] = useState('');
  const [pollingActive, setPollingActive] = useState(true);

  useEffect(() => {
    if (orderId && phone) {
      localStorage.setItem('loomra_latest_order_id', orderId);
      localStorage.setItem('loomra_latest_order_phone', phone);
    }
  }, [orderId, phone]);

  // Handle gateway redirect with verified TrxID
  useEffect(() => {
    if (orderId && (trxIdParam || statusParam === 'verified')) {
      fetch('/api/orders/update-trx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderId,
          transactionId: trxIdParam || 'AmaderPay-Verified',
          markAsPaid: true,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setOrderState((prev) => ({
              ...prev,
              loading: false,
              paymentStatus: 'Paid',
              transactionId: data.transactionId || trxIdParam,
            }));
            setPollingActive(false);
          }
        })
        .catch((err) => console.error('[Auto Update Trx Error]:', err));
    }
  }, [orderId, trxIdParam, statusParam]);

  const checkStatus = useCallback(async () => {
    if (!orderId) return;
    try {
      const res = await fetch(`/api/orders/check-status?orderId=${orderId}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setOrderState({
          loading: false,
          paymentStatus: data.paymentStatus,
          paymentMethod: data.paymentMethod || 'AmaderPay',
          transactionId: data.transactionId,
          totalAmount: data.totalAmount,
        });

        if (data.paymentStatus === 'Paid') {
          setPollingActive(false);
        }
      }
    } catch (err) {
      console.error('[Check Status Error]:', err);
    } finally {
      setOrderState((prev) => ({ ...prev, loading: false }));
    }
  }, [orderId]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Live polling for payment auto-match (every 4 seconds if pending)
  useEffect(() => {
    if (!pollingActive || !orderId || orderState.paymentStatus === 'Paid') return;

    const interval = setInterval(() => {
      checkStatus();
    }, 4000);

    const timeout = setTimeout(() => {
      setPollingActive(false);
    }, 120000); // Stop polling after 2 minutes

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [pollingActive, orderId, orderState.paymentStatus, checkStatus]);

  const handleManualTrxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxInput.trim() || trxInput.trim().length < 5) {
      setTrxErrorMsg('অনুগ্রহ করে সঠিক Transaction ID (TrxID) লিখুন (কমপক্ষে ৫ অক্ষর)');
      return;
    }

    setSubmittingTrx(true);
    setTrxErrorMsg('');
    setTrxSuccessMsg('');

    try {
      const res = await fetch('/api/orders/update-trx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderId,
          transactionId: trxInput.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTrxSuccessMsg(`ধন্যবাদ! আপনার TrxID (${data.transactionId}) সফলভাবে সেভ করা হয়েছে।`);
        setOrderState((prev) => ({ ...prev, transactionId: data.transactionId }));
        setTrxInput('');
        checkStatus();
      } else {
        setTrxErrorMsg(data.error || 'TrxID আপডেট করতে সমস্যা হয়েছে।');
      }
    } catch (err) {
      setTrxErrorMsg('সার্ভারে যোগাযোগ করতে সমস্যা হয়েছে।');
    } finally {
      setSubmittingTrx(false);
    }
  };

  const isPaid = orderState.paymentStatus === 'Paid';
  const isAmaderPayOrMobile = orderState.paymentMethod?.toLowerCase().includes('amaderpay') || 
                              orderState.paymentMethod?.toLowerCase().includes('bkash') || 
                              orderState.paymentMethod?.toLowerCase().includes('nagad');

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 py-10 lg:py-20 animate-in fade-in duration-500 max-w-xl mx-auto">
      
      {/* Header Success Icon */}
      <div className="relative mb-6">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 size={44} className="text-emerald-600" />
        </div>
        {isPaid && (
          <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full border-2 border-white">
            <Zap size={14} className="fill-white" />
          </span>
        )}
      </div>

      <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-[#1A1A1A] mb-2">
        Order Confirmed<span className="text-emerald-600">!</span>
      </h1>
      <p className="text-gray-500 text-xs md:text-sm max-w-md mx-auto mb-6 font-medium leading-relaxed">
        ধন্যবাদ! আপনার অর্ডারটি সফলভাবে আমাদের সিস্টেমে তৈরি করা হয়েছে।
      </p>

      {/* Order ID Badge */}
      {orderId && (
        <div className="bg-white border border-gray-200 shadow-sm px-6 py-4 rounded-2xl mb-6 w-full flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Order Number</span>
            <span className="text-xl font-black text-gray-900">#{orderId}</span>
          </div>
          {orderState.totalAmount && (
            <div className="text-right">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Total Amount</span>
              <span className="text-xl font-black text-emerald-600">৳ {orderState.totalAmount.toLocaleString()}</span>
            </div>
          )}
        </div>
      )}

      {/* Payment Status Block */}
      {isPaid ? (
        /* Paid Status Banner */
        <div className="w-full bg-emerald-50 border border-emerald-200 p-4 rounded-2xl mb-6 text-left space-y-1.5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
              <ShieldCheck size={18} className="text-emerald-600" />
              <span>⚡ Payment Verified &amp; Confirmed (Paid)</span>
            </div>
            <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
              Paid
            </span>
          </div>
          {orderState.transactionId && (
            <p className="text-[11px] text-emerald-700 font-mono pl-6">
              TrxID: <strong className="font-bold">{orderState.transactionId}</strong>
            </p>
          )}
        </div>
      ) : (
        /* Pending Auto-Verify / Manual Trx Entry Card */
        <div className="w-full bg-stone-900 border border-stone-800 text-white p-5 rounded-2xl mb-6 text-left space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-amber-400" />
              <span className="text-xs font-bold text-stone-200">পেমেন্ট ভেরিফিকেশন স্ট্যাটাস</span>
            </div>
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
              Pending
            </span>
          </div>

          {/* Auto-Verify Polling Bar */}
          {isAmaderPayOrMobile && (
            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-stone-300 text-[11px]">
                {pollingActive ? (
                  <>
                    <RefreshCw size={14} className="animate-spin text-pink-500 shrink-0" />
                    <span>bKash / Nagad SMS অটোমেটিক ট্র্যাকিং চলছে...</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={14} className="text-amber-400 shrink-0" />
                    <span>অটো-ম্যাচ না হলে নিচে আপনার TrxID সাবমিট করুন</span>
                  </>
                )}
              </div>
              <button
                onClick={() => checkStatus()}
                type="button"
                className="text-[10px] bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold px-2.5 py-1 rounded-lg transition"
              >
                Re-check
              </button>
            </div>
          )}

          {/* Manual TrxID Submission Box */}
          <form onSubmit={handleManualTrxSubmit} className="space-y-2 pt-1">
            <label className="block text-[11px] font-semibold text-stone-300">
              পেমেন্ট করে থাকলে TrxID দিন (যদি অটো-ম্যাচ না হয়):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={trxInput}
                onChange={(e) => setTrxInput(e.target.value)}
                placeholder="e.g. BLA9823457"
                className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono placeholder-stone-600 focus:outline-none focus:border-pink-500 transition"
              />
              <button
                type="submit"
                disabled={submittingTrx}
                className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition disabled:opacity-50 shrink-0"
              >
                {submittingTrx ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                <span>Submit</span>
              </button>
            </div>

            {trxSuccessMsg && (
              <p className="text-[11px] text-emerald-400 font-medium pt-1 flex items-center gap-1">
                <CheckCircle2 size={12} /> {trxSuccessMsg}
              </p>
            )}

            {trxErrorMsg && (
              <p className="text-[11px] text-rose-400 font-medium pt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {trxErrorMsg}
              </p>
            )}
          </form>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Link
          href={`/track-order?id=${orderId}&phone=${phone}`}
          className="flex-1 bg-black text-white px-6 py-3.5 text-xs font-black uppercase tracking-[0.15em] hover:bg-[#A31F24] transition-all rounded-xl shadow-lg active:scale-95 text-center"
        >
          Track My Order
        </Link>
        <Link
          href="/shop"
          className="flex-1 bg-white text-black border border-gray-200 px-6 py-3.5 text-xs font-black uppercase tracking-[0.15em] hover:bg-gray-50 transition-all rounded-xl active:scale-95 text-center"
        >
          Back to Shop
        </Link>
      </div>

    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
