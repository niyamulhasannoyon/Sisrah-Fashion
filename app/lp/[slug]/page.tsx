import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import LandingPage from '@/models/LandingPage';
import LandingPageClient from '@/components/landing/LandingPageClient';
import { getDirectImageLink } from '@/lib/utils';

interface LpPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

// ── Helper: filter out null products from populated array ──
function safeProducts(products: any[]): any[] {
  return (products || []).filter((p: any) => p && typeof p === 'object' && p._id);
}

// ── Helper: safely get price from product ──
function safePrice(p: any): number {
  if (!p) return 0;
  return p.offerPrice || p.basePrice || 0;
}

export async function generateMetadata({ params }: LpPageProps): Promise<Metadata> {
  await dbConnect();
  const { slug } = await params;

  try {
    const raw = await LandingPage.findOne({ slug, isActive: true })
      .populate('productIds', 'title description basePrice offerPrice images')
      .lean() as any;

    if (!raw) {
      return { title: 'Page Not Found - AS SIDRAT' };
    }

    const products = safeProducts(raw.productIds);
    const product = products[0];
    const heading = raw.customHero?.customHeading || product?.title || raw.pageTitle;
    const description = raw.customHero?.customSubheading || product?.description || 'Shop the latest collection at AS SIDRAT.';
    const bannerImage = (raw.customHero?.customBannerImage && getDirectImageLink(raw.customHero.customBannerImage.trim())) || product?.images?.[0]?.url || '/og-image.jpg';

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
  } catch (err) {
    console.error('[LP Metadata] Error:', err);
    return {
      title: 'AS SIDRAT',
      description: 'Shop the latest collection at AS SIDRAT.',
    };
  }
}

export default async function LpPage({ params }: LpPageProps) {
  await dbConnect();
  const { slug } = await params;

  try {
    const raw = await LandingPage.findOne({ slug, isActive: true })
      .populate('productIds')
      .lean() as any;

    if (!raw) {
      notFound();
    }

    // Safe clone with null-filtered products
    const products = safeProducts(raw.productIds);
    const page = {
      ...JSON.parse(JSON.stringify(raw)),
      productIds: products,
    };

    // ── Build Schema.org markup for the landing page ──
    const schemaMarkup = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: page.pageTitle,
      description: page.customHero?.customSubheading || `Shop ${page.pageTitle} at AS SIDRAT`,
      url: `https://assidrat.com/lp/${slug}`,
      brand: { '@type': 'Brand', name: 'AS SIDRAT' },
      ...(products.length > 0 && {
        mainEntity: page.layoutType === 'single-product'
          ? {
              '@type': 'Product',
              name: products[0]?.title || page.pageTitle,
              offers: {
                '@type': 'Offer',
                priceCurrency: 'BDT',
                price: safePrice(products[0]).toString(),
                availability: 'https://schema.org/InStock',
              },
            }
          : {
              '@type': 'ItemList',
              itemListElement: products.map((p: any, i: number) => ({
                '@type': 'ListItem',
                position: i + 1,
                item: {
                  '@type': 'Product',
                  name: p.title || 'Product',
                  offers: {
                    '@type': 'Offer',
                    priceCurrency: 'BDT',
                    price: safePrice(p).toString(),
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
  } catch (err) {
    console.error('[LP Page] Error:', err);
    notFound();
  }
}
