'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FAQItem {
  question: string;
  answer: React.ReactNode;
  category: 'orders' | 'shipping' | 'payments' | 'returns' | 'fabric';
}

export default function FaqClient() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'orders' | 'shipping' | 'payments' | 'returns' | 'fabric'>('all');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqData: FAQItem[] = [
    {
      category: 'shipping',
      question: 'What are your delivery charges in Bangladesh?',
      answer: 'Our standard shipping charges are ৳80 inside Dhaka city and ৳150 outside Dhaka city. We offer free shipping triggers depending on promotions (e.g. purchasing 2 or more items, or ordering over ৳3,000). Shipping charges will be calculated automatically at checkout.',
    },
    {
      category: 'shipping',
      question: 'How long does delivery take?',
      answer: 'For orders inside Dhaka, delivery takes 2 to 3 business days. For orders outside Dhaka, it typically takes 3 to 5 business days. You will receive an SMS tracking link once your order is dispatched, or you can track it directly using our Track Order page.',
    },
    {
      category: 'payments',
      question: 'Which payment methods do you accept?',
      answer: 'We accept Cash on Delivery (COD) across Bangladesh. We also support digital payments including bKash, Nagad, and local/international credit & debit cards processed securely through SSLCommerz.',
    },
    {
      category: 'returns',
      question: 'What is your return & exchange policy?',
      answer: (
        <span>
          We offer a hassle-free <strong className="text-gray-800">7-day exchange and return policy</strong> for any unused items in their original condition with tags intact. If you face a sizing issue or receive a damaged item, contact us on WhatsApp (+880 1712-345678) or email us at support@assidrat.com to initiate the process. Please note that delivery charges are non-refundable.
        </span>
      ),
    },
    {
      category: 'fabric',
      question: 'Why does AS SIDRAT focus on climate-conscious fabrics?',
      answer: 'Bangladesh has high humidity and hot summers. Standard synthetic/blended clothing traps heat, making it uncomfortable. We craft clothing from 100% premium flax linen and pure combed cotton. These fabrics allow air to flow naturally and absorb moisture, keeping you cool and comfortable.',
    },
    {
      category: 'fabric',
      question: 'How should I wash and care for my Linen Shirt?',
      answer: 'We recommend gentle hand wash or machine wash on a delicate cycle in cold water with mild detergent. Wash dark colors separately. To retain the natural texture, air dry in shade. Linen looks beautiful with its natural organic wrinkles, but if you prefer a crisp look, steam iron while the garment is slightly damp.',
    },
    {
      category: 'orders',
      question: 'Can I change my shipping address after placing an order?',
      answer: 'If you need to change your address or phone number, please contact us immediately on WhatsApp with your Order ID before the parcel is shipped. Once the shipment has been handed over to the courier (usually within 12-24 hours), we cannot change the address.',
    },
    {
      category: 'orders',
      question: 'How do I track my order status?',
      answer: (
        <span>
          You can track your order live. Simply go to our{' '}
          <Link href="/track-order" className="text-[#A31F24] font-semibold hover:underline">
            Track Order
          </Link>{' '}
          page and input your Order ID and Phone Number to see if it is processing, sent to courier, or shipped.
        </span>
      ),
    },
  ];

  const filteredFAQs = faqData.filter(
    (item) => activeCategory === 'all' || item.category === activeCategory
  );

  return (
    <div className="min-h-screen bg-[#FBFBFB] py-20 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#A31F24] mb-3">Customer Support</p>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-gray-900 mb-6">
            FAQ & Support<span className="text-[#A31F24]">.</span>
          </h1>
          <p className="text-gray-500 font-medium max-w-lg mx-auto text-sm leading-relaxed">
            Have questions about ordering, delivery, sizing, or fabrics? Find quick answers below or contact our support team.
          </p>
        </div>

        {/* Category Selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {[
            { id: 'all', label: 'All Questions' },
            { id: 'orders', label: 'Orders' },
            { id: 'shipping', label: 'Delivery' },
            { id: 'payments', label: 'Payments' },
            { id: 'returns', label: 'Returns' },
            { id: 'fabric', label: 'Fabric Care' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id as any);
                setOpenIndex(null); // Close accordion on change
              }}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all ${
                activeCategory === cat.id
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-500 border-gray-100 hover:text-black hover:border-gray-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4 mb-12">
          {filteredFAQs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full py-5 px-6 md:px-8 text-left flex justify-between items-center gap-4 hover:bg-gray-50/50 transition-colors"
                >
                  <span className="font-bold text-gray-900 text-sm md:text-base leading-snug">
                    {faq.question}
                  </span>
                  <span
                    className={`text-xl font-black transition-transform duration-300 shrink-0 select-none ${
                      isOpen ? 'rotate-45 text-[#A31F24]' : 'text-gray-400'
                    }`}
                  >
                    ＋
                  </span>
                </button>
                
                {/* Expandable Panel */}
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? 'max-h-[300px] border-t border-gray-50' : 'max-h-0'
                  }`}
                >
                  <div className="py-5 px-6 md:px-8 text-xs md:text-sm text-gray-600 leading-relaxed font-medium">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact Banner */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 text-center space-y-4">
          <h3 className="text-lg font-black uppercase tracking-tight text-gray-900">Still have questions?</h3>
          <p className="text-gray-500 text-xs md:text-sm max-w-md mx-auto">
            We are here to help. Reach out directly on WhatsApp or drop us an email, and we will get back to you shortly.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <a
              href="https://wa.me/8801712345678"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#A31F24] hover:bg-black text-white px-6 py-3.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#A31F24]/5"
            >
              WhatsApp Support
            </a>
            <a
              href="mailto:support@assidrat.com"
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
            >
              Email support@assidrat.com
            </a>
          </div>
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
