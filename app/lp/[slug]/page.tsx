import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import LandingPage from '@/models/LandingPage';
import LandingPageClient from '@/components/landing/LandingPageClient';

interface LpPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: LpPageProps): Promise<Metadata> {
  await dbConnect();
  const { slug } = await params;

  const page = await LandingPage.findOne({ slug, isActive: true })
    .populate('productIds', 'title description basePrice offerPrice images')
    .lean() as any;

  if (!page) {
    return { title: 'Page Not Found - AS SIDRAT' };
  }

  const product = page.productIds?.[0];
  const heading = page.customHero?.customHeading || product?.title || page.pageTitle;
  const description = page.customHero?.customSubheading || product?.description || 'Shop the latest collection at AS SIDRAT.';
  const bannerImage = page.customHero?.customBannerImage || product?.images?.[0]?.url || '/og-image.jpg';

  return {
    title: `${heading} — AS SIDRAT`,
    description,
    openGraph: {
      title: `${heading} — AS SIDRAT`,
      description,
      images: [{ url: bannerImage, width: 1200, height: 630 }],
      type: 'website',
      url: `https://assidrat.com/lp/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${heading} — AS SIDRAT`,
      description,
      images: [bannerImage],
    },
    robots: { index: true, follow: true },
  };
}

export default async function LpPage({ params }: LpPageProps) {
  await dbConnect();
  const { slug } = await params;

  const raw = await LandingPage.findOne({ slug, isActive: true })
    .populate('productIds')
    .lean() as any;

  if (!raw) {
    notFound();
  }

  const page = JSON.parse(JSON.stringify(raw));

  // ── Build Schema.org markup for the landing page ──
  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.pageTitle,
    description: page.customHero?.customSubheading || `Shop ${page.pageTitle} at AS SIDRAT`,
    url: `https://assidrat.com/lp/${slug}`,
    brand: { '@type': 'Brand', name: 'AS SIDRAT' },
    ...(page.productIds?.length > 0 && {
      mainEntity: page.layoutType === 'single-product'
        ? {
            '@type': 'Product',
            name: page.productIds[0]?.title || page.pageTitle,
            offers: {
              '@type': 'Offer',
              priceCurrency: 'BDT',
              price: (page.productIds[0]?.offerPrice || page.productIds[0]?.basePrice || 0).toString(),
              availability: 'https://schema.org/InStock',
            },
          }
        : {
            '@type': 'ItemList',
            itemListElement: page.productIds.map((p: any, i: number) => ({
              '@type': 'ListItem',
              position: i + 1,
              item: {
                '@type': 'Product',
                name: p.title,
                offers: {
                  '@type': 'Offer',
                  priceCurrency: 'BDT',
                  price: (p.offerPrice || p.basePrice).toString(),
                },
              },
            })),
          },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />
      <LandingPageClient page={page} />
    </>
  );
}
