import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service - AS SIDRAT',
  description: 'Review the terms and conditions for purchasing and using the AS SIDRAT online storefront.',
  alternates: {
    canonical: 'https://assidrat.com/terms-of-service',
  },
  openGraph: {
    title: 'Terms of Service - AS SIDRAT',
    description: 'Review the terms and conditions for purchasing and using the AS SIDRAT online storefront.',
    url: 'https://assidrat.com/terms-of-service',
    type: 'website',
    siteName: 'AS SIDRAT',
    locale: 'en_BD',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service - AS SIDRAT',
    description: 'Review the terms and conditions for purchasing and using the AS SIDRAT online storefront.',
  }
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#FBFBFB] py-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#A31F24] mb-3">Legal & Compliance</p>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-gray-900 mb-6">
            Terms of Service<span className="text-[#A31F24]">.</span>
          </h1>
          <p className="text-gray-500 font-medium max-w-lg mx-auto text-sm leading-relaxed">
            By visiting or shopping at AS SIDRAT, you agree to follow the terms and conditions outlined below.
          </p>
        </div>

        {/* Content Block */}
        <div className="bg-white p-8 md:p-12 rounded-[32px] shadow-sm border border-gray-100/80 text-gray-700 space-y-10 leading-relaxed text-sm md:text-base">
          
          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-tight text-gray-900 flex items-center gap-3">
              <span className="h-6 w-1 bg-[#A31F24] inline-block"></span>
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using this website, you agree to be bound by these Terms of Service and all applicable laws and regulations in Bangladesh. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-tight text-gray-900 flex items-center gap-3">
              <span className="h-6 w-1 bg-[#A31F24] inline-block"></span>
              2. User Accounts & Registration
            </h2>
            <p>
              To place orders and access certain features of this website, you may register for an account. You are responsible for maintaining the confidentiality of your account credentials (phone number/password) and for restricting access to your computer or mobile device. You agree to accept responsibility for all activities that occur under your account.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-tight text-gray-900 flex items-center gap-3">
              <span className="h-6 w-1 bg-[#A31F24] inline-block"></span>
              3. Ordering, Pricing & Custom Duty
            </h2>
            <p>
              All prices displayed on <Link href="/" className="text-[#A31F24] font-semibold hover:underline">assidrat.com</Link> are in Bangladeshi Taka (BDT) and exclude delivery charges unless stated otherwise. 
            </p>
            <ul className="list-disc list-inside pl-4 space-y-2 text-gray-600">
              <li>We reserve the right to change our prices at any time without prior notice.</li>
              <li>We reserve the right to cancel or reject any order for reasons including stock unavailability, pricing errors, or suspected fraudulent activity. If your order is cancelled after payment, a full refund will be processed within 7 to 10 working days.</li>
              <li>While we endeavor to display product colors as accurately as possible, variations in screen displays might slightly alter the perceived color.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-tight text-gray-900 flex items-center gap-3">
              <span className="h-6 w-1 bg-[#A31F24] inline-block"></span>
              4. Payment Gateways & Cash on Delivery (COD)
            </h2>
            <p>
              We offer multiple payment options to ensure a smooth checkout experience:
            </p>
            <ul className="list-disc list-inside pl-4 space-y-2 text-gray-600">
              <li><strong className="text-gray-800">Cash on Delivery (COD):</strong> Customers can pay in cash upon receiving the package. Available inside Dhaka and select major cities.</li>
              <li><strong className="text-gray-800">Digital Payments:</strong> Mobile Financial Services (bKash, Nagad) and credit/debit card transactions processed securely via our SSLCommerz integration.</li>
              <li>Payments must be cleared before dispatch for non-COD digital payment methods.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-tight text-gray-900 flex items-center gap-3">
              <span className="h-6 w-1 bg-[#A31F24] inline-block"></span>
              5. Delivery & Shipping
            </h2>
            <p>
              Delivery timeframes are estimates and may vary due to weather conditions, traffic disruptions, or courier operational bottlenecks:
            </p>
            <ul className="list-disc list-inside pl-4 space-y-2 text-gray-600">
              <li><strong className="text-gray-800">Inside Dhaka:</strong> Delivery takes 2 to 3 business days.</li>
              <li><strong className="text-gray-800">Outside Dhaka:</strong> Delivery takes 3 to 5 business days.</li>
              <li>The customer is responsible for providing the correct delivery address and contact number. If a parcel is returned due to incorrect coordinates, additional re-shipping charges will apply.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-tight text-gray-900 flex items-center gap-3">
              <span className="h-6 w-1 bg-[#A31F24] inline-block"></span>
              6. Limitation of Liability
            </h2>
            <p>
              AS SIDRAT shall not be liable for any special, direct, indirect, or consequential damages resulting from your use of, or inability to use, our services or website, even if we have been advised of the possibility of such damages.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-tight text-gray-900 flex items-center gap-3">
              <span className="h-6 w-1 bg-[#A31F24] inline-block"></span>
              7. Governing Law
            </h2>
            <p>
              These Terms of Service are governed by and construed in accordance with the laws of the People's Republic of Bangladesh. Any dispute arising out of or related to these terms shall be subject to the exclusive jurisdiction of the courts of Dhaka, Bangladesh.
            </p>
          </section>

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
