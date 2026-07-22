import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import LandingPage from '@/models/LandingPage';
import Product from '@/models/Product';
import LandingPageClient from '@/components/landing/LandingPageClient';
import { getDirectImageLink } from '@/lib/utils';

interface LpPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

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

  // Prevent compiler tree-shaking of Product model
  const _forceRegister = Product.modelName;

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
      metadataBase: new URL('https://assidrat.com'),
      alternates: {
        canonical: `/lp/${slug}`,
      },
      openGraph: {
        title: `${heading} — AS SIDRAT`,
        description,
        url: `https://assidrat.com/lp/${slug}`,
        siteName: 'AS SIDRAT',
        images: [
          {
            url: bannerImage,
            width: 1200,
            height: 630,
            alt: heading,
            type: 'image/jpeg',
          },
        ],
        locale: 'bn_BD',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${heading} — AS SIDRAT`,
        description,
        images: [bannerImage],
      },
      other: {
        'facebook-domain-verification': process.env.NEXT_PUBLIC_FB_DOMAIN_VERIFICATION || '',
      },
      robots: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    };
  } catch (err) {
    console.error('[LP Metadata] Error:', err);
    return {
      title: 'AS SIDRAT',
      description: 'Shop premium fashion at AS SIDRAT.',
    };
  }
}

export default async function LpPage({ params }: LpPageProps) {
  await dbConnect();
  const { slug } = await params;

  // Prevent compiler tree-shaking of Product model
  const _forceRegister = Product.modelName;

  let raw;
  try {
    raw = await LandingPage.findOne({ slug, isActive: true })
      .populate('productIds')
      .lean() as any;
  } catch (err) {
    console.error('[LP Page] Database query failed:', err);
    throw err;
  }

  if (!raw) {
    notFound();
  }

  // Safe clone with null-filtered products
  const products = safeProducts(raw.productIds);
  const page = {
    ...JSON.parse(JSON.stringify(raw)),
    productIds: products,
  };

  const firstProduct = products[0];
  const bannerImage = (raw.customHero?.customBannerImage && getDirectImageLink(raw.customHero.customBannerImage.trim())) || firstProduct?.images?.[0]?.url || '/og-image.jpg';

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
            image: products[0]?.images?.map((img: any) => img.url) || [bannerImage],
            description: products[0]?.description || page.pageTitle,
            offers: {
              '@type': 'Offer',
              priceCurrency: 'BDT',
              price: safePrice(products[0]).toString(),
              availability: 'https://schema.org/InStock',
              itemCondition: 'https://schema.org/NewCondition',
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
                image: p.images?.[0]?.url || bannerImage,
                offers: {
                  '@type': 'Offer',
                  priceCurrency: 'BDT',
                  price: safePrice(p).toString(),
                  availability: 'https://schema.org/InStock',
                },
              },
            })),
          },
    }),
  };

  return (
    <>
      <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://connect.facebook.net" crossOrigin="anonymous" />
      {bannerImage && (
        <link
          rel="preload"
          as="image"
          href={bannerImage}
          // @ts-ignore
          fetchPriority="high"
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />
      <LandingPageClient page={page} />
    </>
  );
}

