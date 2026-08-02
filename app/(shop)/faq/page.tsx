import type { Metadata } from 'next';
import FaqClient from '@/components/ui/FaqClient';

const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'https://assidrat.vercel.app').replace(/\/+$/, '');

export const metadata: Metadata = {
  title: 'FAQ & Customer Support - AS SIDRAT (Sidrat)',
  description: 'Got questions about shipping, sizing, or returns? Find answers to frequently asked questions about shopping with AS SIDRAT (Sidrat) in Bangladesh.',
  alternates: {
    canonical: `${BASE_URL}/faq`,
  },
  openGraph: {
    title: 'FAQ & Customer Support - AS SIDRAT (Sidrat)',
    description: 'Got questions about shipping, sizing, or returns? Find answers to frequently asked questions about shopping with AS SIDRAT in Bangladesh.',
    url: `${BASE_URL}/faq`,
    type: 'website',
    siteName: 'AS SIDRAT | Sidrat Fashion BD',
    locale: 'en_BD',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQ & Customer Support - AS SIDRAT (Sidrat)',
    description: 'Got questions about shipping, sizing, or returns? Find answers to frequently asked questions about shopping with AS SIDRAT in Bangladesh.',
  }
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What are your delivery charges in Bangladesh?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Our standard shipping charges are ৳80 inside Dhaka city and ৳150 outside Dhaka city. We offer free shipping triggers depending on promotions.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does delivery take?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'For orders inside Dhaka, delivery takes 2 to 3 business days. For orders outside Dhaka, it typically takes 3 to 5 business days.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which payment methods do you accept?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We accept Cash on Delivery (COD) across Bangladesh. We also support digital payments including bKash, Nagad, and local/international cards.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is your return & exchange policy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We offer a hassle-free 7-day exchange and return policy for any unused items in their original condition with tags intact.',
      },
    },
  ],
};

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <FaqClient />
    </>
  );
}
