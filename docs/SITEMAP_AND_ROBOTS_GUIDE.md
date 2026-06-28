# 🤖 SITEMAP & ROBOTS.TXT ENTERPRISE SEO SETUP

## Table of Contents
1. [Overview](#overview)
2. [Sitemap Configuration](#sitemap-configuration)
3. [Robots.txt Configuration](#robotstxt-configuration)
4. [Implementation](#implementation)
5. [Testing & Validation](#testing--validation)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)

---

## Overview

This guide covers two critical crawl directives for your AS SIDRAT Next.js e-commerce platform:

### 🗺️ Sitemap.xml
- **What:** Complete list of URLs search engines should crawl
- **File:** `app/sitemap.ts`
- **Output:** `/sitemap.xml`
- **Purpose:** Helps Google discover all products and categories
- **Benefit:** Faster indexing, better coverage

### 🚫 Robots.txt
- **What:** Rules telling search engine bots what to crawl
- **File:** `public/robots.txt`
- **Output:** `/robots.txt`
- **Purpose:** Control crawl budget, block sensitive pages
- **Benefit:** Security, efficiency, crawl budget optimization

---

## Sitemap Configuration

### File Location
```
app/sitemap.ts
```

### How It Works

**1. Static Pages** (Homepage, Shop, Categories)
```
Routes like /shop, /category/men are included with:
- Priority: 0.6-1.0 (homepage is highest)
- Changefreq: daily (main pages change often)
- Lastmod: Auto-calculated based on config
```

**2. Dynamic Categories**
```
All product categories are included:
- /category/men
- /category/women
- /category/fusion
- /category/accessories

Each with:
- Priority: 0.9
- Changefreq: weekly
```

**3. Dynamic Products** (Fetched from Database)
```
Each product in MongoDB gets an entry:
- /product/[slug]
- Lastmod: Product's updatedAt timestamp
- Changefreq: weekly
- Priority: 0.7
```

### Output Example

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://assidrat.com/</loc>
    <lastmod>2026-06-28</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://assidrat.com/product/classic-linen-shirt</loc>
    <lastmod>2026-06-25</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <!-- ... more URLs ... -->
</urlset>
```

### Priority & Changefreq Guidelines

| Page Type | Priority | Changefreq | Why |
|-----------|----------|------------|-----|
| Homepage | 1.0 | daily | Most important, content changes |
| Main Categories | 0.9 | weekly | Important landing pages |
| Products | 0.7 | weekly | Inventory & reviews change |
| Secondary Pages | 0.6 | monthly | Rarely change |
| Footer Links | 0.5 | yearly | Static content |

### Customization

**Add New Category:**
```typescript
const PRODUCT_CATEGORIES = [
  // ... existing
  {
    slug: 'kids',
    label: 'Kids Collection',
    priority: 0.85,
    changefreq: 'weekly' as const,
  },
];
```

**Add New Static Page:**
```typescript
const STATIC_PAGES = [
  // ... existing
  {
    url: '/returns-policy',
    priority: 0.5,
    changefreq: 'monthly' as const,
    lastModDaysAgo: 30,
  },
];
```

### Performance Considerations

- **Database Optimization:** Only fetches slug, updatedAt, category
- **Error Handling:** Falls back to static pages if database fails
- **Caching:** Next.js automatically caches sitemap generation
- **Max URLs:** Supports 50,000+ URLs per sitemap
- **Large Sites:** For >50k URLs, split into multiple sitemaps (sitemap index)

---

## Robots.txt Configuration

### File Location
```
public/robots.txt
```

### Structure

#### 1. **Universal Rules** (User-agent: *)
Apply to all search engine bots

#### 2. **Search Engine-Specific Rules**
- Google (Googlebot, Googlebot-Image, Googlebot-Mobile)
- Bing (Bingbot)
- DuckDuckGo
- Others

#### 3. **Bad Bot Blocks** (Optional)
- AhrefsBot (SEO crawler)
- SemrushBot (SEO crawler)
- MJ12bot (aggressive crawler)

### Key Directives

#### ✅ ALLOW Paths (Should Be Crawled)

```
Allow: /shop                    # Main shop page
Allow: /category/               # All categories
Allow: /product/                # All products
Allow: /community               # Community section
Allow: /_next/static/           # Next.js assets (CSS, JS)
Allow: /images/                 # Static images
```

#### ❌ DISALLOW Paths (Should NOT Be Crawled)

```
# Checkout & Payment (Sensitive)
Disallow: /checkout
Disallow: /checkout/

# User Accounts (Private)
Disallow: /profile
Disallow: /profile/

# Authentication (No SEO value)
Disallow: /login
Disallow: /register
Disallow: /auth/

# Admin (Security)
Disallow: /admin
Disallow: /admin/

# API Routes (Not for indexing)
Disallow: /api/

# Search/Query Parameters (Duplicate content)
Disallow: /*?search=
Disallow: /*?sort=
Disallow: /*?filter=
```

### Complete Rule Set

```
# Homepage (crawl it!)
Allow: /

# Shopping (crawl it!)
Allow: /shop
Allow: /category/
Allow: /product/

# But NOT these (security, privacy, quality)
Disallow: /checkout
Disallow: /profile
Disallow: /admin
Disallow: /api/
Disallow: /login
Disallow: /?search=

# Point to sitemap
Sitemap: https://assidrat.com/sitemap.xml
```

---

## Implementation

### Step 1: Deploy Sitemap

The sitemap is already implemented in `app/sitemap.ts`

**Verify it works:**
```bash
curl https://assidrat.com/sitemap.xml
# Should return XML with all URLs
```

### Step 2: Deploy Robots.txt

The robots.txt is already deployed to `public/robots.txt`

**Verify it works:**
```bash
curl https://assidrat.com/robots.txt
# Should return robots.txt directives
```

### Step 3: Register with Search Engines

#### Google Search Console
1. Go to https://search.google.com/search-console
2. Select your property (assidrat.com)
3. Go to **Sitemaps** → **New Sitemap**
4. Enter: `https://assidrat.com/sitemap.xml`
5. Click **Submit**

#### Bing Webmaster Tools
1. Go to https://www.bing.com/webmasters
2. Select your site
3. Go to **Sitemaps**
4. Submit: `https://assidrat.com/sitemap.xml`

#### Yandex (if targeting Russia/CIS)
1. Go to https://webmaster.yandex.com/
2. Add your site
3. Submit sitemap

### Step 4: Monitor Crawling

**Google Search Console:**
1. → **Crawl Stats** dashboard
2. Monitor "Requests per day" trend
3. Look for blocked pages section
4. Check for crawl errors

**Analytics:**
1. Track bot traffic in Google Analytics
2. Monitor indexation rate
3. Check for indexing issues

---

## Testing & Validation

### ✅ Test Robots.txt

#### Method 1: Google Search Console
1. Go to Google Search Console
2. → **Tools** → **robots.txt Tester**
3. Paste URLs to test
4. See if they're blocked or allowed

#### Method 2: Command Line
```bash
# Check if path is allowed
curl -I https://assidrat.com/admin        # Should be blocked
curl -I https://assidrat.com/shop         # Should be allowed
```

#### Method 3: Online Tester
- https://www.screaming-frog.co.uk/seo-spider/
- https://www.seobility.net/en/seocheck/

### ✅ Test Sitemap

#### Method 1: Google Search Console
1. → **Sitemaps** section
2. Look for status "Success"
3. View "Discovered URLs"
4. Check "Indexed URLs"

#### Method 2: Online Validator
1. https://www.xml-sitemaps.com/validate-xml-sitemap.html
2. Enter: https://assidrat.com/sitemap.xml
3. Should show 0 errors

#### Method 3: Browser
1. Visit: https://assidrat.com/sitemap.xml
2. Should return valid XML
3. Should list all products

### ✅ Test Individual Pages

```bash
# Check if product is in sitemap
curl https://assidrat.com/sitemap.xml | grep "classic-linen-shirt"

# Check if robots.txt is blocking checkout
curl https://assidrat.com/robots.txt | grep "Disallow: /checkout"
```

---

## Monitoring & Maintenance

### Weekly Checklist

- [ ] Check Google Search Console for new crawl errors
- [ ] Verify sitemap was last updated (should be recent)
- [ ] Monitor crawl budget usage
- [ ] Check for indexation rate (should be 90%+)

### Monthly Tasks

- [ ] Review blocked pages in robots.txt
- [ ] Verify all main categories in sitemap
- [ ] Update products with stale timestamps
- [ ] Check for 404s in new products

### Quarterly Review

- [ ] Analyze crawl stats trend
- [ ] Review robots.txt for needed changes
- [ ] Update product priorities if business changes
- [ ] Check for duplicate content issues

### Google Search Console Dashboard

**Key Metrics to Monitor:**

| Metric | Target | Issue If |
|--------|--------|----------|
| URLs Indexed | 90%+ of submitted | <80% = blocking or quality issues |
| Crawl Rate | Stable | Increasing = crawl budget wasted |
| Coverage | "No errors/warnings" | Errors = pages not being indexed |
| Blocked by robots.txt | Expected (admin, checkout) | Unexpected paths = check rules |

---

## Troubleshooting

### Problem: "Sitemap not found"

**Cause:** Sitemap route not generating
**Solution:**
```bash
# Verify sitemap generation
next build
# Should complete without errors

# Test locally
npm run dev
# Visit: http://localhost:3000/sitemap.xml
```

### Problem: "Products not appearing in sitemap"

**Cause:** Database connection issue or no products

**Solution:**
```typescript
// Add logging to sitemap.ts
console.log('Products fetched:', products.length);

// Verify products exist in DB
db.products.countDocuments() // Should > 0
```

### Problem: "Robots.txt not being respected"

**Cause:** Syntax error or rule conflict

**Solution:**
```bash
# Validate robots.txt syntax
https://www.screaming-frog.co.uk/seo-spider/

# Check for conflicting rules
# More specific rules take precedence
Disallow: /checkout        # Specific ✓
Disallow: /              # Blocks everything ✗
```

### Problem: "Crawl rate too high"

**Cause:** Not setting appropriate crawl-delay

**Solution:**
```
# In robots.txt (most bots ignore, but worth trying)
Crawl-delay: 1

# Better solution: Optimize website performance
# - Faster pages = lower crawl impact
# - Reduce server load = higher crawl budget
```

### Problem: "Google not indexing new products"

**Cause:** Sitemap not being recognized

**Solution:**
1. Verify sitemap is valid (no XML errors)
2. Submit manually in Google Search Console
3. Request indexing for specific URLs
4. Check for noindex meta tags

### Problem: "Error: 404 on product URLs"

**Cause:** Products were deleted but still in sitemap

**Solution:**
```typescript
// Filter out inactive products
const products = await Product.find(
  { isActive: true },  // Only active
  { slug: 1, updatedAt: 1 }
);
```

---

## Advanced Configuration

### Split Sitemap for Large Sites

If you have 50,000+ products, create a sitemap index:

**app/sitemap.ts:**
```typescript
export default async function sitemap() {
  return [
    {
      url: 'https://assidrat.com/sitemap-pages.xml',
      lastModified: new Date(),
    },
    {
      url: 'https://assidrat.com/sitemap-products-1.xml',
      lastModified: new Date(),
    },
    {
      url: 'https://assidrat.com/sitemap-products-2.xml',
      lastModified: new Date(),
    },
  ];
}
```

### Dynamic Robots.txt

Create `app/robots.ts` for dynamic rules:

```typescript
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/checkout'],
    },
    sitemap: 'https://assidrat.com/sitemap.xml',
  };
}
```

### Prevent Indexing (If Needed)

Add to `app/layout.tsx`:
```typescript
export const metadata: Metadata = {
  robots: {
    index: true,              // Allow indexing
    follow: true,             // Follow links
    nocache: false,          // Allow caching
  },
};
```

---

## SEO Impact

### Expected Results

| Timeline | Metric | Impact |
|----------|--------|--------|
| **Week 1** | Sitemap Discovery | Google finds new URLs faster |
| **Week 2-4** | Indexation | 50-90% of products indexed |
| **Month 2** | Rankings | Products start ranking for keywords |
| **Month 3+** | Traffic | Organic search traffic increases 25-50% |

### Metrics to Track

1. **Indexation Rate** - Percentage of submitted URLs in Google index
2. **Crawl Budget** - How many pages Google crawls daily
3. **Average Position** - Average ranking for tracked keywords
4. **Click-Through Rate** - Clicks from search results

---

## Best Practices Summary

✅ **DO:**
- Update sitemap when adding/removing products
- Block sensitive pages in robots.txt
- Monitor Google Search Console regularly
- Keep robots.txt and actual content in sync
- Test changes before deploying

❌ **DON'T:**
- Use robots.txt as security (it's not!)
- Block CSS/JS files (search engines need them)
- Create massive sitemaps (>50k URLs should be split)
- Forget to submit sitemap to Search Console
- Put sensitive data on pages blocked by robots.txt

---

## Resources

📖 **Official Documentation:**
- [Sitemaps.org Protocol](https://www.sitemaps.org/)
- [Google Sitemap Guide](https://developers.google.com/search/docs/advanced/sitemaps/overview)
- [Robots.txt Standard](https://www.robotstxt.org/)
- [Google robots.txt Guide](https://developers.google.com/search/docs/advanced/robots/robots_txt)

🔗 **Tools:**
- [Google Search Console](https://search.google.com/search-console)
- [robots.txt Tester](https://search.google.com/search-console)
- [XML Sitemap Validator](https://www.xml-sitemaps.com/validate-xml-sitemap.html)
- [Screaming Frog](https://www.screaming-frog.co.uk/)

📊 **Monitoring:**
- [Google Search Console](https://search.google.com/search-console)
- [Bing Webmaster Tools](https://www.bing.com/webmasters)
- Google Analytics

---

**Last Updated:** June 28, 2026  
**For:** AS SIDRAT Fashion E-commerce  
**Technology:** Next.js 13+ App Router with TypeScript
