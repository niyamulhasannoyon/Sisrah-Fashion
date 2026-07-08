import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy - AS SIDRAT',
  description: 'Learn how AS SIDRAT handles and protects your personal information and transaction security.',
  alternates: {
    canonical: 'https://assidrat.com/privacy-policy',
  },
  openGraph: {
    title: 'Privacy Policy - AS SIDRAT',
    description: 'Learn how AS SIDRAT handles and protects your personal information and transaction security.',
    url: 'https://assidrat.com/privacy-policy',
    type: 'website',
    siteName: 'AS SIDRAT',
    locale: 'en_BD',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy - AS SIDRAT',
    description: 'Learn how AS SIDRAT handles and protects your personal information and transaction security.',
  }
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FBFBFB] py-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#A31F24] mb-3">Legal & Compliance</p>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-gray-900 mb-6">
            Privacy Policy<span className="text-[#A31F24]">.</span>
          </h1>
          <p className="text-gray-500 font-medium max-w-lg mx-auto text-sm leading-relaxed">
            At AS SIDRAT, we value your privacy. This policy explains how we collect, use, and protect your personal information.
          </p>
        </div>

        {/* Content Block */}
        <div className="bg-white p-8 md:p-12 rounded-[32px] shadow-sm border border-gray-100/80 text-gray-700 space-y-10 leading-relaxed text-sm md:text-base">
          
          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-tight text-gray-900 flex items-center gap-3">
              <span className="h-6 w-1 bg-[#A31F24] inline-block"></span>
              1. Introduction
            </h2>
            <p>
              Welcome to AS SIDRAT (<Link href="/" className="text-[#A31F24] font-semibold hover:underline">assidrat.com</Link>). 
              We are committed to protecting the privacy and security of your personal data. This Privacy Policy describes how we collect, use, and disclose personal data when you visit our website, place an order, or engage with our services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-tight text-gray-900 flex items-center gap-3">
              <span className="h-6 w-1 bg-[#A31F24] inline-block"></span>
              2. Information We Collect
            </h2>
            <p>
              We collect information necessary to fulfill your orders and improve your shopping experience. This includes:
            </p>
            <ul className="list-disc list-inside pl-4 space-y-2 text-gray-600">
              <li><strong className="text-gray-800">Identity Details:</strong> Full name, billing address, shipping address, and phone number.</li>
              <li><strong className="text-gray-800">Contact Information:</strong> Email address and mobile phone number (used for order confirmation, delivery coordination, and billing updates).</li>
              <li><strong className="text-gray-800">Payment Information:</strong> We support digital payments (bKash, Nagad, cards). Note that all credit/debit card transactions are processed securely through certified payment gateways (e.g., SSLCommerz), and we do not store your raw card details on our servers.</li>
              <li><strong className="text-gray-800">Technical Data:</strong> IP address, device type, browser settings, and page engagement metrics collected via cookies.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-tight text-gray-900 flex items-center gap-3">
              <span className="h-6 w-1 bg-[#A31F24] inline-block"></span>
              3. How We Use Your Information
            </h2>
            <p>We process your personal information based on legitimate business interests, including:</p>
            <ul className="list-disc list-inside pl-4 space-y-2 text-gray-600">
              <li>Processing and shipping your orders.</li>
              <li>Providing order tracking updates via SMS or email.</li>
              <li>Authenticating users during login and registration.</li>
              <li>Responding to customer support requests and resolving disputes.</li>
              <li>Sending newsletters, seasonal promotional material, and special discount offers (you can opt-out at any time).</li>
              <li>Preventing fraudulent activities and securing our platform.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-tight text-gray-900 flex items-center gap-3">
              <span className="h-6 w-1 bg-[#A31F24] inline-block"></span>
              4. Data Sharing and Third Parties
            </h2>
            <p>
              We do not sell, rent, or trade your personal data with third parties. We share your information only with trusted partners essential to operating our business:
            </p>
            <ul className="list-disc list-inside pl-4 space-y-2 text-gray-600">
              <li><strong className="text-gray-800">Logistics Providers:</strong> Delivery and courier services in Bangladesh to deliver your package to your doorstep.</li>
              <li><strong className="text-gray-800">Payment Gateways:</strong> Secure transaction engines (SSLCommerz) to process your credit/debit cards or mobile banking payments safely.</li>
              <li><strong className="text-gray-800">Analytics Providers:</strong> Google Analytics and Meta Pixel to help us analyze visitor behaviors and optimize our design.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-tight text-gray-900 flex items-center gap-3">
              <span className="h-6 w-1 bg-[#A31F24] inline-block"></span>
              5. Data Security
            </h2>
            <p>
              We implement industry-standard security measures, including HTTPS encryption, secure database queries, and token-based user authentication, to protect your data from unauthorized access, modification, or disclosure.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-tight text-gray-900 flex items-center gap-3">
              <span className="h-6 w-1 bg-[#A31F24] inline-block"></span>
              6. Cookies and Tracking
            </h2>
            <p>
              Our website uses cookies to store items in your shopping cart, remember your login state, and capture analytical usage statistics. You can configure your browser to reject cookies, though some features of our site may not function properly as a result.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-tight text-gray-900 flex items-center gap-3">
              <span className="h-6 w-1 bg-[#A31F24] inline-block"></span>
              7. Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy, your personal data, or wish to exercise your rights to delete or correct your account details, please contact us:
            </p>
            <div className="bg-gray-50/70 p-6 rounded-2xl border border-gray-100 text-gray-600 text-sm space-y-2">
              <p>📍 <strong>Address:</strong> Gulshan-2, Dhaka, Bangladesh</p>
              <p>✉️ <strong>Email:</strong> <a href="mailto:support@assidrat.com" className="text-[#A31F24] hover:underline font-semibold">support@assidrat.com</a></p>
              <p>📞 <strong>WhatsApp Support:</strong> +880 1712-345678</p>
            </div>
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
