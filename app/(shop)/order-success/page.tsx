'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-12 lg:py-24">
      <CheckCircle2 size={64} className="text-green-600 mb-6" />
      <h1 className="text-3xl font-bold uppercase tracking-widest text-[#1A1A1A] mb-4">
        Order Confirmed!
      </h1>
      <p className="text-gray-600 max-w-md mx-auto mb-2">
        Thank you for your purchase. We have received your order and will begin processing it right away.
      </p>
      {orderId && (
        <p className="text-sm font-medium text-gray-500 bg-gray-100 px-4 py-2 rounded mb-8">
          Order ID: {orderId}
        </p>
      )}
      
      <Link href="/shop" className="bg-[#1A1A1A] text-white px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-[#A31F24] transition-colors rounded">
        Continue Shopping
      </Link>
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
