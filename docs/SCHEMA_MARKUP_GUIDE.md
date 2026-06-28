# 📋 JSON-LD Product Schema Implementation Guide

## Overview
This guide explains how to implement and use JSON-LD Product Schema markup for your AS SIDRAT fashion e-commerce store. Proper schema markup helps Google, social media platforms, and voice assistants understand your products better.

---

## 🗂️ File Structure

```
components/
  └── seo/
      └── ProductSchemaMarkup.tsx          # Main schema component
lib/
  └── schema/
      └── schemaValidation.ts               # Validation utilities
```

---

## 📦 What You Get

### 1. **ProductSchemaMarkup Component** (`components/seo/ProductSchemaMarkup.tsx`)
A reusable React component that generates valid JSON-LD Product Schema

### 2. **Schema Validation Utilities** (`lib/schema/schemaValidation.ts`)
Functions to validate, format, and debug your schemas

---

## 🚀 Quick Start

### Step 1: Import the Component
```typescript
import ProductSchemaMarkup from '@/components/seo/ProductSchemaMarkup';
```

### Step 2: Use in Your Product Page
Add the component to your page (typically in the `<head>` or at the top of your component):

```typescript
export default function ProductDetailsClient({ product, reviews }: ProductDetailsClientProps) {
  return (
    <>
      {/* Add this before your main JSX */}
      <ProductSchemaMarkup
        product={{
          id: product._id,
          title: product.title,
          description: product.description || '',
          slug: 'product-slug',
          basePrice: product.basePrice,
          offerPrice: product.offerPrice,
          sku: 'OPTIONAL-SKU',
          category: product.category,
          images: product.images || [],
          rating: product.rating,
          numReviews: product.numReviews,
          variants: product.variants,
          brand: 'AS SIDRAT'
        }}
        baseUrl="https://assidrat.com"
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Your product details JSX */}
      </div>
    </>
  );
}
```

---

## 📊 Schema Fields Explained

### Basic Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `@context` | string | ✅ | Always `https://schema.org/` |
| `@type` | string | ✅ | Always `Product` |
| `name` | string | ✅ | Product title (e.g., "Minimalist Linen Shirt") |
| `description` | string | ✅ | Product description |
| `url` | string | ✅ | Full product URL |
| `image` | array | ✅ | Array of product image URLs (max 3) |
| `sku` | string | ⚠️ | Product SKU (fallback to slug) |

### Pricing Fields
| Field | Type | Required | Example |
|-------|------|----------|---------|
| `offers.@type` | string | ✅ | `Offer` |
| `offers.priceCurrency` | string | ✅ | `BDT` |
| `offers.price` | string | ✅ | `"2499.00"` |
| `offers.itemCondition` | string | ✅ | `https://schema.org/NewCondition` |
| `offers.availability` | string | ✅ | `https://schema.org/InStock` |
| `offers.priceValidUntil` | string | ⚠️ | `2026-07-28` (30 days from now) |

### Brand & Organization
| Field | Type | Default |
|-------|------|---------|
| `brand.@type` | string | `Brand` |
| `brand.name` | string | `AS SIDRAT` |

### Ratings & Reviews
| Field | Type | Condition |
|-------|------|-----------|
| `aggregateRating.@type` | string | If product has ratings |
| `aggregateRating.ratingValue` | float | If `rating` prop provided |
| `aggregateRating.reviewCount` | number | If `numReviews` prop provided |

---

## 💡 Database Integration

### How to Pass Data from MongoDB

Your product document structure:
```typescript
// Product Model
{
  _id: ObjectId("...");
  title: "Minimalist Linen Shirt",
  slug: "minimalist-linen-shirt",
  description: "Premium linen shirt crafted...",
  basePrice: 2999,
  offerPrice: 2499,
  sku: "LINEN-SHIRT-001",
  category: "Shirts",
  images: [
    { url: "https://cdn.example.com/shirt-1.jpg", public_id: "..." },
    { url: "https://cdn.example.com/shirt-2.jpg", public_id: "..." }
  ],
  variants: [
    { size: "S", color: "White", stock: 10, price: 2999 },
    { size: "M", color: "White", stock: 5, price: 2999 },
    { size: "L", color: "Blue", stock: 0, price: 2999 }
  ],
  rating: 4.5,
  numReviews: 24,
}
```

### Using in Components

**Server Component (page.tsx):**
```typescript
import ProductDetailsClient from '@/components/product/ProductDetailsClient';

export default async function ProductPage({ params }: ProductPageProps) {
  await dbConnect();
  
  // Fetch from database
  const product = await Product.findOne({ slug: params.slug }).lean();
  const reviews = await Review.find({ product: product._id }).lean();
  
  const productData = JSON.parse(JSON.stringify(product)); // Serialize
  
  // Pass to client component
  return <ProductDetailsClient product={productData} reviews={reviews} />;
}
```

**Client Component (ProductDetailsClient.tsx):**
```typescript
'use client';

import ProductSchemaMarkup from '@/components/seo/ProductSchemaMarkup';

export default function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  return (
    <>
      {/* Schema markup renders in <head> */}
      <ProductSchemaMarkup
        product={{
          id: product._id,
          title: product.title,                    // From DB
          description: product.description,       // From DB
          slug: product.slug,                     // From DB
          basePrice: product.basePrice,           // From DB
          offerPrice: product.offerPrice,         // From DB
          sku: product.sku,                       // From DB
          category: product.category,             // From DB
          images: product.images,                 // From DB (array)
          rating: product.rating,                 // From DB
          numReviews: product.numReviews,         // From DB
          variants: product.variants,             // From DB (for stock check)
          brand: 'AS SIDRAT'
        }}
      />
      
      {/* Your JSX */}
    </>
  );
}
```

---

## 🔍 Validation & Debugging

### Validate Your Schema

```typescript
import { validateProductSchema, logSchemaValidation } from '@/lib/schema/schemaValidation';

// Inside your component
const schema = {
  '@context': 'https://schema.org/',
  '@type': 'Product',
  name: product.title,
  // ... other fields
};

const validation = validateProductSchema(schema);
if (!validation.valid) {
  console.error('Schema errors:', validation.errors);
}

// Or use the logging utility
logSchemaValidation(schema, 'ProductDetailsPage');
```

### Test with Google Rich Results Test
1. Go to https://search.google.com/test/rich-results
2. Enter your product URL
3. Google will validate and show the structured data

### Test with Schema.org Validator
1. Go to https://validator.schema.org/
2. Paste your JSON-LD or HTML
3. Validator will show any issues

---

## 🎨 Generated Output Example

For a product titled **"Minimalist Linen Shirt - Ocean Blue"** with price **৳2,499**:

```json
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "Minimalist Linen Shirt - Ocean Blue",
  "description": "Premium minimalist linen shirt crafted for South Asian climate...",
  "sku": "LINEN-SHIRT-001",
  "productID": "65a4b3c2d1e2f3g4h5i6j7k8",
  "url": "https://assidrat.com/product/minimalist-linen-shirt",
  "brand": {
    "@type": "Brand",
    "name": "AS SIDRAT"
  },
  "category": "Shirts",
  "image": [
    "https://cdn.example.com/shirt-1.jpg",
    "https://cdn.example.com/shirt-2.jpg",
    "https://cdn.example.com/shirt-3.jpg"
  ],
  "offers": {
    "@type": "Offer",
    "url": "https://assidrat.com/product/minimalist-linen-shirt",
    "priceCurrency": "BDT",
    "price": "2499",
    "priceValidUntil": "2026-07-28",
    "itemCondition": "https://schema.org/NewCondition",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "AS SIDRAT",
      "url": "https://assidrat.com"
    },
    "priceSpecification": [
      {
        "@type": "PriceSpecification",
        "priceCurrency": "BDT",
        "price": "2499",
        "priceType": "https://schema.org/SalePrice"
      },
      {
        "@type": "PriceSpecification",
        "priceCurrency": "BDT",
        "price": "2999",
        "priceType": "https://schema.org/ListPrice"
      }
    ]
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "reviewCount": 24,
    "bestRating": "5",
    "worstRating": "1"
  }
}
```

---

## 🌍 SEO Benefits

✅ **Google Search** - Rich product snippets show ratings, price, availability  
✅ **Google Shopping** - Helps with product visibility  
✅ **Social Media** - Improved preview cards on Facebook, Twitter, LinkedIn  
✅ **Voice Search** - Alexa, Google Assistant can understand your products  
✅ **E-commerce Crawlers** - Better indexing for price comparison sites  

---

## ⚠️ Common Issues

### Issue: "Missing required field"
**Solution:** Ensure all required fields are provided to the component

### Issue: "Invalid image URL"
**Solution:** Ensure image URLs are absolute (not relative) and properly formatted

### Issue: "Invalid price format"
**Solution:** Prices must be strings with 2 decimal places (e.g., "2499.00")

### Issue: "Schema not showing in Google"
**Solution:**
1. Check validation errors
2. Wait 24-48 hours for indexing
3. Resubmit in Google Search Console

---

## 📚 References

- 🔗 [Schema.org Product](https://schema.org/Product)
- 🔗 [Schema.org Offer](https://schema.org/Offer)
- 🔗 [Google Structured Data Guide](https://developers.google.com/search/docs/beginner/structured-data)
- 🔗 [Google Rich Results Test](https://search.google.com/test/rich-results)
- 🔗 [JSON-LD Format](https://json-ld.org/)

---

## 🎯 Best Practices

1. ✅ Keep descriptions under 300 characters for better readability
2. ✅ Use high-quality images (1200x1200px minimum)
3. ✅ Include at least 3 product images
4. ✅ Update pricing regularly (priceValidUntil field)
5. ✅ Include ratings if available (significantly improves CTR)
6. ✅ Test with Google Rich Results Test after deployment
7. ✅ Monitor Google Search Console for structured data errors

---

## 🚀 Next Steps

1. ✅ Import `ProductSchemaMarkup` into your `ProductDetailsClient` component
2. ✅ Map your product data to the component props
3. ✅ Test with Google Rich Results Test
4. ✅ Deploy to production
5. ✅ Monitor Search Console for indexing

---

**Last Updated:** June 28, 2026  
**For:** AS SIDRAT Fashion E-commerce  
**Compatible with:** Next.js 13+ App Router
