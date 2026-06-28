/**
 * AS SIDRAT - SEO CONTENT IMPLEMENTATION GUIDE
 * How to Implement Content Blueprints in Next.js App Router
 * 
 * Real code examples for Homepage and Category pages
 */

// ============================================================================
// EXAMPLE 1: HOMEPAGE METADATA & STRUCTURE
// ============================================================================

/**
 * File: app/(shop)/page.tsx
 * 
 * Implementation of Homepage with SEO-optimized heading structure
 */

export const HOMEPAGE_IMPLEMENTATION = `
'use client';

import { Metadata } from 'next';
import { homepageBlueprint } from '@/lib/seo/contentBlueprint';

// 1. METADATA GENERATION
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: homepageBlueprint.metaTags.title,
    description: homepageBlueprint.metaTags.description,
    keywords: homepageBlueprint.metaTags.keywords,
    openGraph: {
      title: homepageBlueprint.metaTags.ogTitle,
      description: homepageBlueprint.metaTags.ogDescription,
      images: [{ url: homepageBlueprint.metaTags.ogImage }],
    },
    canonical: homepageBlueprint.metaTags.canonicalUrl,
  };
}

export default function HomePage() {
  return (
    <main className="w-full">
      {/* ===== HERO SECTION ===== */}
      <section className="hero-section py-16 bg-gradient">
        <div className="container max-w-6xl mx-auto px-4">
          {/* 
            🔴 CRITICAL: H1 - ONLY ONE PER PAGE
            Include primary keyword: "Premium Minimalist Breathable Fashion"
          */}
          <h1 className="text-4xl md:text-5xl font-bold text-dark mb-6">
            Premium Minimalist Breathable Fashion for the South Asian Climate
          </h1>

          <p className="text-xl text-gray-600 mb-4">
            Ethically-made, premium clothing designed for hot weather.
            Free delivery in Dhaka.
          </p>

          <button className="btn btn-primary">
            Shop the Collection
          </button>
        </div>

        {/* JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'AS SIDRAT',
              url: 'https://assidrat.com',
              logo: 'https://assidrat.com/logo.png',
              description: 'Premium minimalist breathable fashion',
            }),
          }}
        />
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="features-section py-16">
        <div className="container max-w-6xl mx-auto px-4">
          {/* 
            🟢 H2: Support keyword "Why Choose Minimalist Fashion"
            Semantic clarity for Google
          */}
          <h2 className="text-3xl font-bold mb-12">
            Why Choose Minimalist Fashion
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 
              🟡 H3: Specific benefit with supporting keyword
              "Premium Quality with Affordable Pricing"
            */}
            <article className="feature-card">
              <h3 className="text-xl font-semibold mb-4">
                Premium Quality with Affordable Pricing
              </h3>
              <p>
                You don't have to choose between premium quality and 
                reasonable pricing. We prove it's possible.
              </p>
            </article>

            <article className="feature-card">
              <h3 className="text-xl font-semibold mb-4">
                Breathable Fabrics for Hot Weather
              </h3>
              <p>
                Every piece is designed specifically for the South Asian climate
                using premium linen and organic cotton.
              </p>
            </article>

            <article className="feature-card">
              <h3 className="text-xl font-semibold mb-4">
                Sustainable & Ethical Production
              </h3>
              <p>
                We work with fair-trade manufacturers who meet 
                international labor standards.
              </p>
            </article>

            <article className="feature-card">
              <h3 className="text-xl font-semibold mb-4">
                Versatile Pieces for Any Occasion
              </h3>
              <p>
                Minimalist design means each piece works together,
                creating more outfits from fewer items.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ===== COLLECTIONS SECTION ===== */}
      <section className="collections-section py-16 bg-light">
        <div className="container max-w-6xl mx-auto px-4">
          {/* 
            🟢 H2: "Explore Our Collections"
            Guide users through category pages
          */}
          <h2 className="text-3xl font-bold mb-4">
            Explore Our Collections
          </h2>
          <p className="text-lg text-gray-600 mb-12">
            From traditional panjabi to modern minimalist basics, 
            discover the AS SIDRAT difference.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 
              🟡 H3: Each collection gets its own H3
              Helps Google understand page structure
            */}
            <CollectionCard
              heading="Men's Minimalist Wear"
              description="Premium linen shirts and breathable panjabi"
              link="/category/men"
            />
            <CollectionCard
              heading="Women's Ethnic Fusion"
              description="Traditional pieces with modern minimalist design"
              link="/category/women"
            />
            <CollectionCard
              heading="Fusion Collections"
              description="Where tradition meets contemporary style"
              link="/category/fusion"
            />
            <CollectionCard
              heading="Accessories & Essentials"
              description="Handcrafted accessories to complete your look"
              link="/category/accessories"
            />
          </div>
        </div>
      </section>

      {/* ===== WHAT MAKES US DIFFERENT ===== */}
      <section className="usp-section py-16">
        <div className="container max-w-6xl mx-auto px-4">
          {/* 
            🟢 H2: "What Makes AS SIDRAT Different"
            Build brand authority
          */}
          <h2 className="text-3xl font-bold mb-12">
            What Makes AS SIDRAT Different
          </h2>

          <div className="space-y-8">
            <article>
              {/* 
                🟡 H3: Specific differentiator
                "Climate-Conscious Design"
              */}
              <h3 className="text-2xl font-semibold mb-4">
                Climate-Conscious Design
              </h3>
              <p className="text-gray-700">
                Every piece is designed specifically for hot, humid weather.
                We prioritize breathable fabrics like premium linen, organic
                cotton, and natural blends that keep you cool without
                sacrificing style.
              </p>
            </article>

            <article>
              <h3 className="text-2xl font-semibold mb-4">
                Ethical Manufacturing
              </h3>
              <p className="text-gray-700">
                We work with fair-trade manufacturers in Bangladesh who meet
                international labor standards. Quality production means your
                clothes last longer.
              </p>
            </article>

            <article>
              <h3 className="text-2xl font-semibold mb-4">
                Premium Affordability
              </h3>
              <p className="text-gray-700">
                By optimizing our production and cutting unnecessary costs,
                we pass savings to you without compromising on quality.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ===== COMMUNITY SECTION ===== */}
      <section className="community-section py-16 bg-gradient">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          {/* 
            🟢 H2: "Join Our Community"
            Engagement & conversion
          */}
          <h2 className="text-3xl font-bold mb-4">
            Join Our Community of Conscious Consumers
          </h2>
          <p className="text-lg mb-8">
            Get style tips, new collection announcements, and exclusive member benefits.
          </p>

          <NewsletterSignup />
        </div>
      </section>
    </main>
  );
}

// Helper Components
function CollectionCard({ heading, description, link }) {
  return (
    <a href={link} className="collection-card group">
      <div className="bg-white p-6 rounded-lg hover:shadow-lg transition">
        {/* 🟡 H3 IN COLLECTION CARDS */}
        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary">
          {heading}
        </h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </a>
  );
}

function NewsletterSignup() {
  return (
    <form className="max-w-md mx-auto flex gap-2">
      <input
        type="email"
        placeholder="Enter your email"
        className="flex-1 px-4 py-3 rounded"
      />
      <button type="submit" className="btn btn-primary">
        Subscribe
      </button>
    </form>
  );
}
`;

// ============================================================================
// EXAMPLE 2: CATEGORY PAGE IMPLEMENTATION (Men's)
// ============================================================================

export const CATEGORY_PAGE_IMPLEMENTATION = `
'use client';

import { Metadata } from 'next';
import { categoryBlueprint } from '@/lib/seo/contentBlueprint';

export async function generateMetadata(): Promise<Metadata> {
  const blueprint = categoryBlueprint.men;
  
  return {
    title: blueprint.metaTags.title,
    description: blueprint.metaTags.description,
    keywords: blueprint.metaTags.keywords,
  };
}

export default function MensCategoryPage() {
  return (
    <main className="w-full">
      {/* ===== CATEGORY HERO ===== */}
      <section className="category-hero py-12 bg-light">
        <div className="container max-w-6xl mx-auto px-4">
          {/* 
            🔴 H1: ONE per page
            "Men's Premium Minimalist Fashion | Breathable Linen Clothing"
          */}
          <h1 className="text-4xl font-bold mb-4">
            Men's Premium Minimalist Fashion | Breathable Linen Clothing
          </h1>

          <p className="text-lg text-gray-600 mb-6">
            Shop premium men's minimalist clothing designed for hot climates.
            From breathable linen shirts to traditional panjabi.
          </p>
        </div>
      </section>

      {/* ===== CONTENT SECTION ===== */}
      <section className="category-content py-12">
        <div className="container max-w-6xl mx-auto px-4">
          {/* 
            🟢 H2: "Premium Men's Linen Shirts for Every Season"
            Lead keyword for men's section
          */}
          <h2 className="text-3xl font-bold mb-8">
            Premium Men's Linen Shirts for Every Season
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* 
              🟡 H3s under H2
              Each represents a product sub-category
            */}
            <ContentCard
              heading="Casual Linen Shirts for Daily Wear"
              description="Breathable, lightweight linen perfect for everyday style"
            />
            <ContentCard
              heading="Breathable Panjabi for Formal Occasions"
              description="Premium traditional wear designed for comfort in humidity"
            />
            <ContentCard
              heading="Office-Ready Minimalist Pieces"
              description="Professional yet comfortable pieces for the workplace"
            />
          </div>

          {/* 
            🟢 H2: "Why Men Choose AS SIDRAT"
            Brand differentiation
          */}
          <h2 className="text-3xl font-bold mb-8">
            Why Men Choose AS SIDRAT
          </h2>

          <div className="bg-white p-8 rounded-lg mb-16">
            <p className="text-gray-700 mb-6">
              Quality, style, and comfort. That's what AS SIDRAT stands for.
              Our men's collection is built on the promise that premium
              doesn't have to be unaffordable.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 
                🟡 H3: Specific benefits
                "Quality That Lasts Through Seasons"
              */}
              <article>
                <h3 className="text-xl font-semibold mb-3">
                  Quality That Lasts Through Seasons
                </h3>
                <p className="text-gray-600">
                  Premium materials and ethical manufacturing mean your
                  clothes survive countless washes.
                </p>
              </article>

              <article>
                <h3 className="text-xl font-semibold mb-3">
                  Style Without Compromise
                </h3>
                <p className="text-gray-600">
                  Minimalist design that works with your lifestyle, not
                  against it.
                </p>
              </article>

              <article>
                <h3 className="text-xl font-semibold mb-3">
                  Comfort in Hot Weather
                </h3>
                <p className="text-gray-600">
                  Breathable fabrics keep you cool and comfortable all day
                  long.
                </p>
              </article>
            </div>
          </div>

          {/* 
            🟢 H2: "How to Style Minimalist Fashion"
            Educational content for engagement
          */}
          <h2 className="text-3xl font-bold mb-8">
            How to Style Minimalist Fashion
          </h2>

          <div className="space-y-8 mb-16">
            {/* 
              🟡 H3: Specific styling guides
            */}
            <article>
              <h3 className="text-2xl font-semibold mb-4">
                Casual Day Styling Guide
              </h3>
              <p className="text-gray-700">
                Pair a classic linen shirt with neutral trousers for
                effortless everyday style...
              </p>
            </article>

            <article>
              <h3 className="text-2xl font-semibold mb-4">
                Office-to-Weekend Outfits
              </h3>
              <p className="text-gray-700">
                Transition seamlessly from office to weekend with
                versatile pieces...
              </p>
            </article>

            <article>
              <h3 className="text-2xl font-semibold mb-4">
                Layering for Minimalists
              </h3>
              <p className="text-gray-700">
                Learn how to layer minimalist pieces effectively...
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ===== PRODUCTS GRID ===== */}
      <section className="products-section py-12 bg-light">
        <div className="container max-w-6xl mx-auto px-4">
          {/* 
            🟢 H2: "Popular Men's Collections"
            Product showcase
          */}
          <h2 className="text-3xl font-bold mb-8">
            Popular Men's Collections
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Product cards with internal linking */}
            <ProductCard
              name="Classic Linen Shirt"
              image="/images/classic-linen.jpg"
              link="/product/classic-linen-shirt"
            />
            {/* More product cards */}
          </div>
        </div>
      </section>
    </main>
  );
}

function ContentCard({ heading, description }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition">
      <h3 className="text-lg font-semibold mb-2">{heading}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

function ProductCard({ name, image, link }) {
  return (
    <a href={link} className="product-card group">
      <div className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition">
        <div className="bg-gray-200 h-48 flex items-center justify-center">
          <img src={image} alt={name} className="w-full h-full object-cover" />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-dark group-hover:text-primary">
            {name}
          </h3>
          <p className="text-gray-500 text-sm mt-2">Premium quality</p>
        </div>
      </div>
    </a>
  );
}
`;

// ============================================================================
// EXAMPLE 3: KEYWORD PLACEMENT IN COMPONENTS
// ============================================================================

export const KEYWORD_PLACEMENT_EXAMPLE = `
/**
 * Best practices for natural keyword placement
 * in H1, H2, H3 tags
 */

// ❌ BAD - Keyword Stuffing
<h1>
  Men's Minimalist Fashion Men's Linen Shirts Minimalist Clothing Bangladesh
</h1>

// ✅ GOOD - Natural Keyword Integration
<h1>
  Men's Premium Minimalist Fashion | Breathable Linen Clothing Bangladesh
</h1>

// ❌ BAD - Multiple Keywords in H2
<h2>
  Premium Men's Linen Shirts Breathable Casual Wear Office Fashion
</h2>

// ✅ GOOD - One main keyword per H2
<h2>
  Premium Men's Linen Shirts for Every Season
</h2>

// ❌ BAD - H3 doesn't support H2
<h2>Products Overview</h2>
<h3>Buy Now Button</h3>

// ✅ GOOD - H3 supports H2 topic
<h2>Premium Men's Linen Shirts</h2>
<h3>Casual Linen Shirts for Daily Wear</h3>
<h3>Breathable Panjabi for Formal Occasions</h3>
<h3>Office-Ready Minimalist Pieces</h3>
`;

// ============================================================================
// EXAMPLE 4: INTERNAL LINKING STRATEGY
// ============================================================================

export const INTERNAL_LINKING_EXAMPLE = `
/**
 * Strategic internal linking improves SEO and UX
 * Links related pages and distributes authority
 */

// Homepage links to categories
<a href="/category/men" className="link">
  men's minimalist wear  {/* ✅ Descriptive anchor text */}
</a>

// Category page links to products
<a href="/product/classic-linen-shirt" className="link">
  breathable linen shirts  {/* ✅ Natural, keyword-rich */}
</a>

// Related products link
<a href="/product/indigo-panjabi" className="link">
  traditional panjabi  {/* ✅ Keyword variation */}
</a>

// Cross-category linking
<a href="/category/fusion" className="link">
  fusion collections  {/* ✅ Discovery link */}
</a>

// Resource pages
<a href="/help/size-guide" className="link">
  size guide  {/* ✅ Support link */}
</a>

// Footer strategic links
<footer>
  <a href="/category/men">Men's Fashion</a>
  <a href="/category/women">Women's Fashion</a>
  <a href="/category/fusion">Fusion Wear</a>
  <a href="/category/accessories">Accessories</a>
</footer>
`;

// ============================================================================
// EXAMPLE 5: SCHEMA MARKUP FOR PAGES
// ============================================================================

export const SCHEMA_MARKUP_EXAMPLE = `
// Homepage - Organization Schema
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "AS SIDRAT",
  "url": "https://assidrat.com",
  "logo": "https://assidrat.com/logo.png",
  "description": "Premium minimalist breathable fashion for South Asia",
  "sameAs": [
    "https://instagram.com/assidrat",
    "https://facebook.com/assidrat"
  ]
}

// Category Page - CollectionPage Schema
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Men's Premium Minimalist Fashion",
  "description": "Shop premium men's minimalist clothing designed for hot climates",
  "url": "https://assidrat.com/category/men"
}

// Category with Breadcrumb
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://assidrat.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Men's Fashion",
      "item": "https://assidrat.com/category/men"
    }
  ]
}
`;

// ============================================================================
// QUICK IMPLEMENTATION CHECKLIST
// ============================================================================

export const IMPLEMENTATION_CHECKLIST = {
  homepage: [
    {
      task: 'Add one H1 with primary keyword',
      example: 'Premium Minimalist Breathable Fashion...',
      priority: 'CRITICAL',
    },
    {
      task: 'Add 3-5 H2s for main sections',
      sections: ['Why Choose', 'Collections', 'What Makes Different'],
      priority: 'CRITICAL',
    },
    {
      task: 'Add H3s under each H2',
      count: '8-12 total H3s',
      priority: 'HIGH',
    },
    {
      task: 'Include internal links to category pages',
      count: '4+ links',
      priority: 'HIGH',
    },
    {
      task: 'Add Organization schema markup',
      location: 'Hero section',
      priority: 'HIGH',
    },
    {
      task: 'Optimize meta description',
      length: 'Under 160 characters',
      priority: 'HIGH',
    },
  ],

  categoryPage: [
    {
      task: 'Add one H1 with category keyword',
      example: "Men's Premium Minimalist Fashion",
      priority: 'CRITICAL',
    },
    {
      task: 'Add 4 H2s for category structure',
      sections: [
        'Product type focus',
        'Why choose brand',
        'Styling guide',
        'Product showcase',
      ],
      priority: 'CRITICAL',
    },
    {
      task: 'Add H3s under each H2',
      count: '12-16 total H3s',
      priority: 'HIGH',
    },
    {
      task: 'Include product links in H3s',
      strategy: 'Link specific products mentioned',
      priority: 'HIGH',
    },
    {
      task: 'Add CollectionPage schema',
      location: 'Top of page',
      priority: 'HIGH',
    },
    {
      task: 'Link back to homepage',
      location: 'Header/breadcrumb',
      priority: 'MEDIUM',
    },
  ],
};

// ============================================================================
// MONITORING & TESTING
// ============================================================================

export const MONITORING_GUIDE = {
  weeklyChecks: [
    'Google Search Console: Check impressions for each page',
    'Search Console: Monitor click-through rate (CTR)',
    'Analytics: Track bounce rate by page',
    'Analytics: Monitor average time on page',
  ],

  monthlyChecks: [
    'Verify H1 tags are unique per page',
    'Check heading hierarchy is correct',
    'Test internal links are working',
    'Verify schema markup in Google Rich Results tester',
    'Check that pages rank for target keywords',
  ],

  toolsToUse: [
    'Google Search Console: https://search.google.com/search-console',
    'Rich Results Tester: https://search.google.com/test/rich-results',
    'Lighthouse: Built into Chrome DevTools',
    'SEMrush or Ahrefs: Keyword tracking',
  ],
};
`;

// ============================================================================
// EXPORT ALL IMPLEMENTATIONS
// ============================================================================

export const ALL_IMPLEMENTATIONS = {
  homepage: HOMEPAGE_IMPLEMENTATION,
  categoryPage: CATEGORY_PAGE_IMPLEMENTATION,
  keywords: KEYWORD_PLACEMENT_EXAMPLE,
  internalLinking: INTERNAL_LINKING_EXAMPLE,
  schema: SCHEMA_MARKUP_EXAMPLE,
  checklist: IMPLEMENTATION_CHECKLIST,
  monitoring: MONITORING_GUIDE,
};
