'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const phone = searchParams.get('phone');

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-12 lg:py-24 animate-in fade-in zoom-in duration-500">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-8">
        <CheckCircle2 size={40} className="text-green-600" />
      </div>
      <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-[#1A1A1A] mb-4">
        Order Confirmed<span className="text-green-600">!</span>
      </h1>
      <p className="text-gray-500 max-w-md mx-auto mb-8 font-medium">
        Thank you for your purchase. Your order has been received and will begin processing right away.
      </p>
      
      {orderId && (
        <div className="bg-white border border-gray-100 shadow-sm px-8 py-6 rounded-3xl mb-10 w-full max-w-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Your Order ID</p>
          <p className="text-2xl font-black text-gray-900">#{orderId}</p>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Link 
          href={`/track-order?id=${orderId}&phone=${phone}`} 
          className="flex-1 bg-black text-white px-8 py-4 text-xs font-black uppercase tracking-[0.2em] hover:bg-[#A31F24] transition-all rounded-2xl shadow-xl active:scale-95"
        >
          Track My Order
        </Link>
        <Link 
          href="/shop" 
          className="flex-1 bg-white text-black border border-gray-200 px-8 py-4 text-xs font-black uppercase tracking-[0.2em] hover:bg-gray-50 transition-all rounded-2xl active:scale-95"
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
