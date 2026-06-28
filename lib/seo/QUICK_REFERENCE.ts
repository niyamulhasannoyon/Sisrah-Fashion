/**
 * QUICK REFERENCE: Slug & Alt-Text Generation
 * 
 * Quick lookup for common use cases and API reference
 */

// ============================================================================
// QUICK API REFERENCE
// ============================================================================

/**
 * SLUG GENERATION
 * ===============
 * 
 * Function: generateSlug(productName, maxLength?)
 * Input:    Product name (string)
 * Output:   SEO-friendly slug (string)
 * Max:      75 characters (default)
 */

// Basic example
import { generateSlug } from '@/lib/seo/slugAndAltText';

const slug1 = generateSlug('Classic Linen Shirt');
// → 'classic-linen-shirt'

const slug2 = generateSlug('Premium Indigo Panjabi - Handcrafted Quality');
// → 'premium-indigo-panjabi-handcrafted-quality'

const slug3 = generateSlug('ইন্ডিগো পাঞ্জাবী');
// → 'indigo-panjabi'

// Custom max length
const slug4 = generateSlug('Very Long Product Name That Goes On And On', 30);
// → 'very-long-product-name' (truncated to 30 chars)

/**
 * ALT-TEXT GENERATION
 * ===================
 * 
 * Function: generateImageAltText(title, category?, brand?, context?)
 * Input:    Product details (strings)
 * Output:   SEO-friendly alt-text (string)
 * Max:      125 characters (screen reader optimal)
 */

import { generateImageAltText } from '@/lib/seo/slugAndAltText';

const alt1 = generateImageAltText('Classic Linen Shirt', 'Shirts');
// → 'AS SIDRAT Classic Linen Shirt for Men - Premium quality minimalist fashion'

const alt2 = generateImageAltText('Indigo Panjabi', 'Ethnic Wear', 'AS SIDRAT');
// → 'AS SIDRAT Indigo Panjabi - Premium quality minimalist fashion'

const alt3 = generateImageAltText(
  'Summer Cotton Tee',
  'T-Shirts',
  'AS SIDRAT',
  'breathable fabric comfort'
);
// → 'AS SIDRAT Summer Cotton Tee for T-Shirts - breathable fabric comfort'

/**
 * ALT-TEXT VARIANTS (for galleries)
 * ==================================
 * 
 * Function: generateImageAltTextVariants(title, category?, brand?)
 * Input:    Product details (strings)
 * Output:   Array of 5 alt-texts for different image angles
 */

import { generateImageAltTextVariants } from '@/lib/seo/slugAndAltText';

const variants = generateImageAltTextVariants('Classic Linen Shirt', 'Shirts');
// → [
//   'AS SIDRAT Classic Linen Shirt for Men - Premium quality...',
//   'AS SIDRAT Classic Linen Shirt fabric and texture details',
//   'AS SIDRAT Classic Linen Shirt modeled outfit photo',
//   'AS SIDRAT Classic Linen Shirt product flat lay',
//   'AS SIDRAT Classic Linen Shirt color and pattern showcase'
// ]

/**
 * GENERATE ALL SEO CONTENT AT ONCE
 * =================================
 * 
 * Function: generateSEOContent(title, category?, imageUrl?, brand?)
 * Input:    Product information (strings)
 * Output:   Object with slug, altText, variants + validation results
 */

import { generateSEOContent } from '@/lib/seo/slugAndAltText';

const seoContent = generateSEOContent('Classic Linen Shirt', 'Shirts');
console.log(seoContent);
// → {
//   slug: 'classic-linen-shirt',
//   altText: 'AS SIDRAT Classic Linen Shirt for Men - Premium quality...',
//   altTextVariants: [...],
//   slugValidation: { valid: true, errors: [], warnings: [], suggestions: [] },
//   altTextValidation: { valid: true, score: 95, ... }
// }

/**
 * VALIDATE SLUGS & ALT-TEXT
 * ==========================
 * 
 * Function: validateSlug(slug)
 * Function: validateAltText(altText)
 * Output:   Validation result with errors, warnings, score
 */

import { validateSlug, validateAltText } from '@/lib/seo/slugAndAltText';

const slugCheck = validateSlug('classic-linen-shirt');
console.log(slugCheck);
// → {
//   valid: true,
//   errors: [],
//   warnings: [],
//   suggestions: []
// }

const altCheck = validateAltText('AS SIDRAT Classic Linen Shirt - Premium quality');
console.log(altCheck);
// → {
//   valid: true,
//   errors: [],
//   warnings: [],
//   suggestions: [],
//   score: 92
// }

// ============================================================================
// COMMON USE CASES
// ============================================================================

/**
 * USE CASE 1: Product Creation Form
 * Auto-generate slug & alt-text as user types
 */

'use client';

import { useState, useEffect } from 'react';

export function CreateProductForm() {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [altText, setAltText] = useState('');

  useEffect(() => {
    if (title) {
      setSlug(generateSlug(title));
      setAltText(generateImageAltText(title, 'Shirts'));
    }
  }, [title]);

  return (
    <form>
      <input
        placeholder="Product name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input disabled value={slug} placeholder="Auto-generated slug" />
      <textarea disabled value={altText} placeholder="Auto-generated alt-text" />
    </form>
  );
}

/**
 * USE CASE 2: Migrate Existing Products
 * Generate slugs for products that don't have them
 */

export async function migrateProductSlugs(products: any[]) {
  for (const product of products) {
    if (!product.slug) {
      product.slug = generateSlug(product.title);
      // await Product.updateOne({ _id: product._id }, { slug: product.slug });
    }
  }
}

/**
 * USE CASE 3: Next.js Image Component
 * Automatically generate alt-text for images
 */

import Image from 'next/image';

export function ProductImage({ product, imageUrl }: any) {
  const altText = generateImageAltText(product.title, product.category);

  return (
    <Image
      src={imageUrl}
      alt={altText}
      width={500}
      height={500}
    />
  );
}

/**
 * USE CASE 4: Product Gallery with Variants
 * Use different alt-text for each image in gallery
 */

export function ProductGallery({ product, images }: any) {
  const variants = generateImageAltTextVariants(product.title, product.category);

  return (
    <div>
      {images.map((image: any, idx: number) => (
        <Image
          key={idx}
          src={image.url}
          alt={variants[idx] || variants[0]}
          width={200}
          height={200}
        />
      ))}
    </div>
  );
}

/**
 * USE CASE 5: SEO Metadata in Page Head
 * Generate meta description and canonical URL
 */

import type { Metadata } from 'next';

export function generateProductMetadata(product: any): Metadata {
  const slug = generateSlug(product.title);
  const altText = generateImageAltText(product.title, product.category);

  return {
    title: `${product.title} - AS SIDRAT`,
    description: product.description?.substring(0, 160) || altText,
    alternates: {
      canonical: `https://assidrat.com/product/${slug}`,
    },
  };
}

/**
 * USE CASE 6: Social Media Integration
 * Generate shareable content with proper alt-text
 */

export function generateShareableContent(product: any) {
  const altText = generateImageAltText(product.title, product.category);

  return {
    title: product.title,
    description: product.description,
    image: product.images?.[0]?.url,
    altText: altText, // For image alt on social platforms
    url: `https://assidrat.com/product/${generateSlug(product.title)}`,
  };
}

// ============================================================================
// COMMON PATTERNS & MISTAKES
// ============================================================================

/**
 * PATTERN 1: Bengali Products
 */

const bengaliProduct = 'ইন্ডিগো পাঞ্জাবী';

// ✅ CORRECT: Automatically transliterates
const goodSlug = generateSlug(bengaliProduct);
// → 'indigo-panjabi'

// ❌ WRONG: Manual slugification without proper transliteration
const badSlug = 'bengali-product'; // Loses meaning

/**
 * PATTERN 2: Long Product Names
 */

const longName = 'Premium Handcrafted Indigo Panjabi with Traditional Embroidery';

// ✅ CORRECT: Auto-truncates intelligently
const goodLongSlug = generateSlug(longName);
// → 'premium-handcrafted-indigo-panjabi-with-traditional'

// ❌ WRONG: Manual slug that's too long
const badLongSlug = 'premium-handcrafted-indigo-panjabi-with-traditional-embroidery-design-pattern';

/**
 * PATTERN 3: Special Characters
 */

const specialName = 'Linen Shirt (50% Off!) - Best Seller!';

// ✅ CORRECT: Removes special chars, keeps meaning
const goodSpecialSlug = generateSlug(specialName);
// → 'linen-shirt-50-off-best-seller'

// ❌ WRONG: Including special chars or removing words
const badSpecialSlug = 'linen-shirt'; // Too generic

/**
 * PATTERN 4: Similar Products
 */

const shirts = [
  'Classic Linen Shirt',
  'Classic Linen Shirt Blue',
  'Classic Linen Shirt White',
];

// ✅ CORRECT: Each gets unique descriptive slug
const goodSlugs = shirts.map(s => generateSlug(s));
// → ['classic-linen-shirt', 'classic-linen-shirt-blue', 'classic-linen-shirt-white']

// ❌ WRONG: Same slug for all (duplicate content issues)
const badSlugs = shirts.map(() => 'classic-linen-shirt');

/**
 * PATTERN 5: Image Alt-Text Length
 */

const product = { title: 'Classic Linen Shirt', category: 'Shirts' };

// ✅ CORRECT: Optimized length with all info
const goodAlt = generateImageAltText(product.title, product.category);
// → 'AS SIDRAT Classic Linen Shirt for Men - Premium quality minimalist fashion'
// Length: 85 characters (perfect for screen readers)

// ❌ WRONG: Too short or too long
const badShortAlt = 'shirt'; // Not descriptive
const badLongAlt = 'AS SIDRAT Classic Linen Shirt in beautiful shade of blue that is perfect for hot weather in South Asia...';
// Too long, gets truncated

// ============================================================================
// PERFORMANCE & CACHING TIPS
// ============================================================================

/**
 * TIP 1: Cache Generated Slugs
 * Generate once, reuse everywhere
 */

const slugCache = new Map<string, string>();

export function getCachedSlug(productTitle: string): string {
  if (!slugCache.has(productTitle)) {
    slugCache.set(productTitle, generateSlug(productTitle));
  }
  return slugCache.get(productTitle)!;
}

/**
 * TIP 2: Batch Generation
 * Generate multiple at once for better performance
 */

export function generateSlugsForProducts(products: any[]): Map<string, string> {
  const slugs = new Map<string, string>();
  for (const product of products) {
    slugs.set(product._id, generateSlug(product.title));
  }
  return slugs;
}

/**
 * TIP 3: Validation Results Caching
 * Cache validation to avoid repeated checks
 */

const validationCache = new Map<string, any>();

export function getValidation(slug: string, type: 'slug' | 'alt') {
  const cacheKey = `${type}-${slug}`;
  if (!validationCache.has(cacheKey)) {
    const validation =
      type === 'slug' ? validateSlug(slug) : validateAltText(slug);
    validationCache.set(cacheKey, validation);
  }
  return validationCache.get(cacheKey);
}

// ============================================================================
// DEBUGGING & LOGGING
// ============================================================================

/**
 * Debug: Show all transformations
 */

export function debugProductSEO(productTitle: string) {
  console.group(`🔍 SEO Debug: "${productTitle}"`);

  const slug = generateSlug(productTitle);
  console.log('📝 Slug:', slug);

  const altText = generateImageAltText(productTitle);
  console.log('🏷️  Alt-Text:', altText);

  const slugValidation = validateSlug(slug);
  console.log('✅ Slug Valid:', slugValidation.valid);
  if (!slugValidation.valid) {
    console.error('❌ Errors:', slugValidation.errors);
  }

  const altValidation = validateAltText(altText);
  console.log('✅ Alt-Text Valid:', altValidation.valid);
  console.log(`📊 Alt-Text Score: ${altValidation.score}/100`);

  console.groupEnd();
}

// Usage: debugProductSEO('Classic Linen Shirt')

// ============================================================================
// ENVIRONMENT-SPECIFIC SETTINGS
// ============================================================================

/**
 * Adjust settings based on environment
 */

export const SEO_CONFIG = {
  // Production
  production: {
    slugMaxLength: 75,
    validateOnGenerate: true,
    logErrors: false,
  },
  // Development
  development: {
    slugMaxLength: 75,
    validateOnGenerate: true,
    logErrors: true,
  },
  // Testing
  testing: {
    slugMaxLength: 50,
    validateOnGenerate: true,
    logErrors: true,
  },
};

// Usage:
const config = SEO_CONFIG[process.env.NODE_ENV as keyof typeof SEO_CONFIG];
const slug = generateSlug(productTitle, config.slugMaxLength);

// ============================================================================
// RELATED FUNCTIONS FROM OTHER MODULES
// ============================================================================

// From productMetadata.ts:
// - generateProductMetadata() - Generates full metadata object
// - truncateDescription() - Shortens descriptions for meta tags

// From productSchema.ts:
// - ProductSchemaMarkup component - Generates JSON-LD
// - Schema validation utilities

// From useProductSchema.ts:
// - transformProductForSchema() - Converts DB objects to schema format
// - hasValidStock(), getTotalStock() - Inventory utilities

// ============================================================================
// TESTING EXAMPLES
// ============================================================================

/**
 * Unit tests for slug generation
 */

export const slugTestCases = [
  {
    input: 'Classic Linen Shirt',
    expected: 'classic-linen-shirt',
  },
  {
    input: 'ইন্ডিগো পাঞ্জাবী',
    expected: 'indigo-panjabi',
  },
  {
    input: 'Premium Linen Shirt - 50% Off!',
    expected: 'premium-linen-shirt-50-off',
  },
  {
    input: 'Product (NEW)',
    expected: 'product-new',
  },
];

/**
 * Unit tests for alt-text
 */

export const altTextTestCases = [
  {
    title: 'Classic Linen Shirt',
    category: 'Shirts',
    expectedIncludes: ['AS SIDRAT', 'Classic Linen Shirt', 'Men', 'Premium'],
  },
  {
    title: 'Indigo Panjabi',
    category: 'Ethnic Wear',
    expectedIncludes: ['AS SIDRAT', 'Indigo Panjabi', 'Premium'],
  },
];

// ============================================================================
// ADDITIONAL RESOURCES
// ============================================================================

/*
 * Related Files:
 * - lib/seo/slugAndAltText.ts (Main utility file)
 * - lib/metadata/productMetadata.ts (Metadata generation)
 * - components/seo/ProductSchemaMarkup.tsx (JSON-LD schema)
 * - docs/ON_PAGE_SEO_GUIDE.md (Comprehensive guide)
 * 
 * External Resources:
 * - Google: URL Structure Best Practices
 * - W3C: Image Alt-Text Guidelines
 * - MDN: Web Accessibility
 */
