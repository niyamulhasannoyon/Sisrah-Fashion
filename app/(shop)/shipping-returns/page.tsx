import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Shipping, Delivery & Exchange Policy - AS SIDRAT',
  description: 'Read about our delivery timelines (Dhaka & nationwide), cash on delivery options, and hassle-free 7-day exchange and return policy.',
  alternates: {
    canonical: 'https://assidrat.com/shipping-returns',
  },
  openGraph: {
    title: 'Shipping, Delivery & Exchange Policy - AS SIDRAT',
    description: 'Read about our delivery timelines (Dhaka & nationwide), cash on delivery options, and exchange policy.',
    url: 'https://assidrat.com/shipping-returns',
    type: 'website',
    siteName: 'AS SIDRAT',
    locale: 'en_BD',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shipping, Delivery & Exchange Policy - AS SIDRAT',
    description: 'Read about our delivery timelines (Dhaka & nationwide), cash on delivery options, and exchange policy.',
  }
};

export default function ShippingReturnsPage() {
  return (
    <div className="min-h-screen bg-[#FBFBFB] py-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#A31F24] mb-3">Customer Service</p>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-gray-900 mb-6">
            Shipping & Returns<span className="text-[#A31F24]">.</span>
          </h1>
          <p className="text-gray-500 font-medium max-w-lg mx-auto text-sm leading-relaxed">
            Everything you need to know about our shipping charges, delivery times, and 7-day exchange process.
          </p>
        </div>

        {/* Content Block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          
          {/* Shipping Policy Card */}
          <div className="bg-white p-8 md:p-10 rounded-[32px] shadow-sm border border-gray-100/80 space-y-6">
            <h2 className="text-xl font-bold uppercase tracking-tight text-gray-900 flex items-center gap-3">
              <span className="h-6 w-1 bg-[#A31F24] inline-block"></span>
              Shipping & Delivery
            </h2>
            
            <div className="space-y-4 text-sm text-gray-600 leading-relaxed font-medium">
              <p>
                We deliver to all locations across Bangladesh. We work with leading logistics partners to ensure your premium garments arrive in pristine condition.
              </p>
              
              <div className="border-t border-b border-gray-50 py-4 my-2 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-bold">Inside Dhaka:</span>
                  <span className="text-[#A31F24] font-black">৳80 (2-3 Business Days)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-bold">Outside Dhaka:</span>
                  <span className="text-[#A31F24] font-black">৳150 (3-5 Business Days)</span>
                </div>
              </div>

              <p className="text-xs text-gray-400">
                * Note: Delivery times are approximate. Deliveries may be delayed during public holidays, bad weather, or remote location routing.
              </p>

              <h4 className="font-bold text-gray-800 uppercase tracking-wider text-xs pt-2">Cash on Delivery (COD)</h4>
              <p>
                We support Cash on Delivery nationwide. You can examine the package before making the payment. Please pay the invoice amount in full directly to the courier agent.
              </p>
            </div>
          </div>

          {/* Returns Policy Card */}
          <div className="bg-white p-8 md:p-10 rounded-[32px] shadow-sm border border-gray-100/80 space-y-6">
            <h2 className="text-xl font-bold uppercase tracking-tight text-gray-900 flex items-center gap-3">
              <span className="h-6 w-1 bg-[#A31F24] inline-block"></span>
              Exchange & Returns
            </h2>
            
            <div className="space-y-4 text-sm text-gray-600 leading-relaxed font-medium">
              <p>
                Your satisfaction is our primary concern. If your garment does not fit perfectly, or if you receive a product with an manufacturing defect, we offer a <strong className="text-gray-900">7-day exchange window</strong>.
              </p>
              
              <h4 className="font-bold text-gray-800 uppercase tracking-wider text-xs border-b border-gray-50 pb-2">Conditions for Eligibility</h4>
              <ul className="list-disc list-inside pl-1 space-y-2 text-xs text-gray-500">
                <li>The item must be unworn, unwashed, and unaltered.</li>
                <li>Original price tags, labels, and packaging must remain attached.</li>
                <li>Invoice copy must be included in the return package.</li>
              </ul>

              <h4 className="font-bold text-gray-800 uppercase tracking-wider text-xs pt-2">How to Request an Exchange</h4>
              <p>
                Send us a message on WhatsApp (+880 1712-345678) or email support@assidrat.com with your Order ID, product details, and the size you wish to exchange. Our team will coordinate the return pickup.
              </p>
            </div>
          </div>

        </div>

        {/* Refund Policy */}
        <div className="bg-white p-8 md:p-10 rounded-[32px] shadow-sm border border-gray-100 mb-12 space-y-4 text-sm text-gray-600 leading-relaxed font-medium">
          <h2 className="text-xl font-bold uppercase tracking-tight text-gray-900 mb-4 flex items-center gap-3">
            <span className="h-6 w-1 bg-[#A31F24] inline-block"></span>
            Refunds
          </h2>
          <p>
            In cases where an item is out of stock or cannot be replaced, we will issue a refund:
          </p>
          <ul className="list-disc list-inside pl-4 space-y-2 text-gray-500">
            <li>For digital prepayments (bKash/Nagad/SSLCommerz), the refund will be credited back to your original transaction account within 7 to 10 working days.</li>
            <li>For COD orders, refunds will be processed via bKash or Nagad after verifying account details with the customer.</li>
            <li>Please note that original shipping charges are non-refundable unless the return is due to our shipping error.</li>
          </ul>
        </div>
        
        {/* Back Link */}
        <div className="text-center mt-12">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#A1A1AA] hover:text-[#A31F24] transition-colors">
            ← Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
}
