/**
 * ON-PAGE SEO UTILITIES - INTEGRATION EXAMPLES
 * 
 * This file demonstrates practical examples of using the slug and alt-text
 * generation utilities in your Next.js application
 */

// ============================================================================
// EXAMPLE 1: Auto-Generate SEO Content in Product Admin Form
// ============================================================================

'use client';

import { useState, useEffect } from 'react';
import {
  generateSlug,
  generateImageAltText,
  generateSEOContent,
  validateSlug,
  validateAltText,
} from '@/lib/seo/slugAndAltText';

/**
 * ProductAdminForm - Auto-generates SEO content as user types
 * Useful for product creation/editing in admin panel
 */
export function ProductAdminFormExample() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Shirts');
  const [slug, setSlug] = useState('');
  const [altText, setAltText] = useState('');
  const [slugErrors, setSlugErrors] = useState<string[]>([]);
  const [altTextScore, setAltTextScore] = useState(0);

  // Auto-generate SEO content when title or category changes
  useEffect(() => {
    if (title.trim()) {
      const seoContent = generateSEOContent(title, category);

      setSlug(seoContent.slug);
      setAltText(seoContent.altText);
      setSlugErrors(seoContent.slugValidation.errors);
      setAltTextScore(seoContent.altTextValidation.score);
    }
  }, [title, category]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  return (
    <form className="space-y-6 max-w-2xl mx-auto">
      {/* Product Title Input */}
      <div>
        <label className="block text-sm font-semibold mb-2">Product Title *</label>
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="e.g., Classic Linen Shirt or ইন্ডিগো পাঞ্জাবী"
          className="w-full border border-gray-300 rounded-lg px-4 py-2"
          maxLength={100}
        />
        <p className="text-xs text-gray-500 mt-1">
          {title.length}/100 - Supports Bengali and English
        </p>
      </div>

      {/* Category Select */}
      <div>
        <label className="block text-sm font-semibold mb-2">Category *</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2"
        >
          <option value="Shirts">Men's Shirts</option>
          <option value="Ethnic Wear">Ethnic Wear</option>
          <option value="T-Shirts">T-Shirts</option>
          <option value="Trousers">Trousers</option>
          <option value="Women's Dresses">Women's Dresses</option>
        </select>
      </div>

      {/* Generated Slug */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          URL Slug (Auto-generated)
        </label>
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="text"
              value={slug}
              readOnly
              className="w-full border border-gray-300 bg-gray-50 rounded-lg px-4 py-2"
            />
          </div>
          <button
            type="button"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
            onClick={() => {
              navigator.clipboard.writeText(slug);
            }}
          >
            Copy
          </button>
        </div>
        {slugErrors.length > 0 && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {slugErrors.map((error, i) => (
              <div key={i}>❌ {error}</div>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Preview: /product/{slug}
        </p>
      </div>

      {/* Generated Alt-Text */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Image Alt-Text (Auto-generated)
          <span className={`ml-2 text-xs font-bold ${
            altTextScore >= 80 ? 'text-green-600' :
            altTextScore >= 60 ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            Score: {altTextScore}/100
          </span>
        </label>
        <textarea
          value={altText}
          readOnly
          className="w-full border border-gray-300 bg-gray-50 rounded-lg px-4 py-2 resize-none"
          rows={3}
        />
        <p className="text-xs text-gray-500 mt-1">
          {altText.length}/125 characters (optimal for screen readers)
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800"
      >
        Create Product
      </button>
    </form>
  );
}

// ============================================================================
// EXAMPLE 2: Batch Generate Slugs for Existing Products
// ============================================================================

/**
 * Utility to batch generate slugs for products without them
 * Run in admin or migration script
 */
export async function batchGenerateSlugs(products: Array<{
  _id: string;
  title: string;
  category?: string;
}>) {
  const results = products.map((product) => ({
    _id: product._id,
    title: product.title,
    slug: generateSlug(product.title),
    category: product.category,
  }));

  // Update database (pseudo code)
  for (const item of results) {
    console.log(`Updating product ${item._id}:`);
    console.log(`  Slug: ${item.slug}`);
    // await Product.findByIdAndUpdate(item._id, { slug: item.slug });
  }

  return results;
}

// ============================================================================
// EXAMPLE 3: Generate Multiple Alt-Text Variants for Gallery
// ============================================================================

'use client';

import Image from 'next/image';
import { generateImageAltTextVariants } from '@/lib/seo/slugAndAltText';

interface ProductGalleryProps {
  product: {
    title: string;
    category: string;
    images: Array<{
      url: string;
      type?: 'main' | 'detail' | 'lifestyle' | 'flat-lay' | 'variant';
    }>;
  };
}

/**
 * ProductGallery - Uses variant alt-text for each image
 */
export function ProductGalleryExample({ product }: ProductGalleryProps) {
  const altTextVariants = generateImageAltTextVariants(
    product.title,
    product.category
  );

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="bg-gray-100 rounded-lg overflow-hidden">
        <Image
          src={product.images[0]?.url || '/placeholder.jpg'}
          alt={altTextVariants[0]} // Main product image alt
          width={600}
          height={600}
          priority
          className="w-full h-auto"
        />
      </div>

      {/* Thumbnail Gallery */}
      <div className="grid grid-cols-4 gap-2">
        {product.images.slice(1, 5).map((image, idx) => (
          <div
            key={idx}
            className="bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-75"
          >
            <Image
              src={image.url}
              alt={altTextVariants[idx + 1] || altTextVariants[0]} // Use variant alt-text
              width={150}
              height={150}
              className="w-full h-auto"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: Real-Time SEO Score in Product Editor
// ============================================================================

'use client';

import { useState, useEffect } from 'react';
import {
  generateSlug,
  generateImageAltText,
  validateSlug,
  validateAltText,
} from '@/lib/seo/slugAndAltText';

/**
 * SEOScoreDisplay - Shows real-time SEO quality score
 */
export function SEOScoreDisplayExample() {
  const [title, setTitle] = useState('Classic Linen Shirt');
  const [category, setCategory] = useState('Shirts');
  const [slug, setSlug] = useState('');
  const [altText, setAltText] = useState('');
  const [scores, setScores] = useState({ slug: 0, altText: 0 });

  useEffect(() => {
    const newSlug = generateSlug(title);
    const newAltText = generateImageAltText(title, category);

    setSlug(newSlug);
    setAltText(newAltText);

    const slugValidation = validateSlug(newSlug);
    const altTextValidation = validateAltText(newAltText);

    // Calculate scores (100 if valid, deduct for warnings)
    const slugScore = slugValidation.valid ? 100 : Math.max(0, 100 - (slugValidation.errors.length * 20));
    const altTextScore = altTextValidation.score;

    setScores({
      slug: slugScore,
      altText: altTextScore,
    });
  }, [title, category]);

  const overallScore = Math.round((scores.slug + scores.altText) / 2);
  const scoreColor =
    overallScore >= 80 ? 'text-green-600' :
    overallScore >= 60 ? 'text-yellow-600' :
    'text-red-600';

  return (
    <div className="bg-white border rounded-lg p-6 space-y-4 max-w-2xl">
      {/* Overall Score */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">On-Page SEO Score</h3>
        <div className={`text-3xl font-bold ${scoreColor}`}>
          {overallScore}
          <span className="text-gray-400 text-lg">/100</span>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-2 gap-4">
        {/* Slug Score */}
        <div className="border rounded-lg p-4">
          <h4 className="text-sm font-semibold mb-2">URL Slug</h4>
          <div className="flex items-center gap-2">
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  scores.slug >= 80 ? 'bg-green-500' :
                  scores.slug >= 60 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${scores.slug}%` }}
              />
            </div>
            <span className="font-bold">{Math.round(scores.slug)}</span>
          </div>
          <p className="text-xs text-gray-600 mt-2">{slug}</p>
        </div>

        {/* Alt-Text Score */}
        <div className="border rounded-lg p-4">
          <h4 className="text-sm font-semibold mb-2">Image Alt-Text</h4>
          <div className="flex items-center gap-2">
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  scores.altText >= 80 ? 'bg-green-500' :
                  scores.altText >= 60 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${scores.altText}%` }}
              />
            </div>
            <span className="font-bold">{Math.round(scores.altText)}</span>
          </div>
          <p className="text-xs text-gray-600 mt-2 line-clamp-2">{altText}</p>
        </div>
      </div>

      {/* Recommendations */}
      {overallScore < 80 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-yellow-900 mb-2">💡 Recommendations:</p>
          <ul className="text-sm text-yellow-800 space-y-1">
            {scores.slug < 80 && (
              <li>• Make your URL slug more descriptive</li>
            )}
            {scores.altText < 80 && (
              <li>• Add more detail to your image alt-text</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: Integration with Next.js Image Component
// ============================================================================

import { generateImageAltText } from '@/lib/seo/slugAndAltText';

interface OptimizedProductImageProps {
  src: string;
  productTitle: string;
  category: string;
  brand?: string;
  priority?: boolean;
}

/**
 * OptimizedProductImage - Wrapper around Next.js Image component
 * Automatically generates SEO-friendly alt-text
 */
export function OptimizedProductImage({
  src,
  productTitle,
  category,
  brand = 'AS SIDRAT',
  priority = false,
}: OptimizedProductImageProps) {
  const altText = generateImageAltText(productTitle, category, brand);

  return (
    <Image
      src={src}
      alt={altText}
      width={500}
      height={500}
      priority={priority}
      className="w-full h-auto rounded-lg"
    />
  );
}

// Usage:
// <OptimizedProductImage
//   src={imageUrl}
//   productTitle="Classic Linen Shirt"
//   category="Shirts"
//   priority
// />

// ============================================================================
// EXAMPLE 6: Database Model with Auto-Generated Slug
// ============================================================================

/**
 * Example Mongoose schema with pre-save hook for slug generation
 */

/*
import mongoose from 'mongoose';
import { generateSlug } from '@/lib/seo/slugAndAltText';

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: String,
  slug: { type: String, unique: true, sparse: true },
  basePrice: Number,
  images: [{ url: String }],
});

// Auto-generate slug before saving
ProductSchema.pre('save', async function(next) {
  if (this.isModified('title') || !this.slug) {
    // Generate slug from title
    let slug = generateSlug(this.title);
    
    // Ensure uniqueness by appending number if needed
    let counter = 1;
    let existingProduct = await this.constructor.findOne({ slug });
    
    while (existingProduct && existingProduct._id !== this._id) {
      slug = `${generateSlug(this.title)}-${counter}`;
      existingProduct = await this.constructor.findOne({ slug });
      counter++;
    }
    
    this.slug = slug;
  }
  next();
});

const Product = mongoose.model('Product', ProductSchema);
export default Product;
*/

// ============================================================================
// EXAMPLE 7: SEO Metadata Generation Helper
// ============================================================================

import { generateSlug, generateImageAltText } from '@/lib/seo/slugAndAltText';

/**
 * Helper to generate all SEO metadata for a product in one call
 */
export interface ProductSEOMetadata {
  slug: string;
  url: string;
  altText: string;
  metaDescription: string;
  canonicalUrl: string;
}

export function generateProductSEOMetadata(
  product: {
    title: string;
    category: string;
    description?: string;
    images?: Array<{ url: string }>;
  },
  baseUrl: string = 'https://assidrat.com'
): ProductSEOMetadata {
  const slug = generateSlug(product.title);
  const altText = generateImageAltText(product.title, product.category);

  // Create meta description from product description
  const descriptionBase = product.description || product.title;
  let metaDescription = descriptionBase.substring(0, 160);
  if (metaDescription.length === 160) {
    metaDescription = metaDescription.substring(0, metaDescription.lastIndexOf(' ')) + '...';
  }

  return {
    slug,
    url: `${baseUrl}/product/${slug}`,
    altText,
    metaDescription,
    canonicalUrl: `${baseUrl}/product/${slug}`,
  };
}

// Usage:
// const seoMetadata = generateProductSEOMetadata({
//   title: 'Classic Linen Shirt',
//   category: 'Shirts',
//   description: 'Premium linen shirt...'
// });
