import type { Metadata } from 'next';
import { Montserrat, Hind_Siliguri } from 'next/font/google';
import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '500', '600', '700'],
  display: 'swap'
});

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali'],
  variable: '--font-hind-siliguri',
  weight: ['400', '500', '600', '700'],
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Loomra — Premium Fashion for Bangladesh',
  description: 'Minimalist, climate-conscious eCommerce for Bangladesh with localized payment, delivery, and style.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${hindSiliguri.variable}`}>
      <body className="min-h-screen bg-loomra-white text-loomra-black antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
