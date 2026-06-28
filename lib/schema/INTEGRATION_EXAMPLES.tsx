/**
 * EXAMPLE: How to Integrate ProductSchemaMarkup into ProductDetailsClient
 * 
 * This file shows the exact implementation pattern for your product pages
 * Copy and adapt this code into your actual ProductDetailsClient.tsx
 */

// ============================================================================
// EXAMPLE IMPLEMENTATION
// ============================================================================

import ProductSchemaMarkup from '@/components/seo/ProductSchemaMarkup';
import { useProductSchema } from '@/lib/schema/useProductSchema';

/**
 * OPTION 1: Direct Integration (Recommended)
 * ============================================
 * Add this to the top of your ProductDetailsClient return statement
 */

export function ProductDetailsClientExample1({ product }: any) {
  return (
    <>
      {/* 1. Add the Schema Markup Component at the top */}
      <ProductSchemaMarkup
        product={{
          id: product._id,
          title: product.title,
          description: product.description || '',
          slug: product.slug || 'unknown',
          basePrice: product.basePrice,
          offerPrice: product.offerPrice,
          sku: product.sku,
          category: product.category,
          images: product.images || [],
          rating: product.rating,
          numReviews: product.numReviews,
          variants: product.variants,
          brand: 'AS SIDRAT',
        }}
        baseUrl="https://assidrat.com"
      />

      {/* 2. Your regular product JSX continues as normal */}
      <div className="container mx-auto px-4 py-8">
        <h1>{product.title}</h1>
        {/* ... rest of your component */}
      </div>
    </>
  );
}

/**
 * OPTION 2: Using the Hook (Best Practice)
 * ==========================================
 * Use the useProductSchema hook for cleaner code and extra utilities
 */

export function ProductDetailsClientExample2({ product }: any) {
  const { schemaData, isInStock, stockCount, discount } = useProductSchema(product);

  return (
    <>
      {/* Schema markup with transformed data */}
      <ProductSchemaMarkup
        product={schemaData}
        baseUrl="https://assidrat.com"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between">
          <h1>{product.title}</h1>
          {isInStock && (
            <span className="text-green-600 font-bold">
              {stockCount} Items in Stock
            </span>
          )}
        </div>

        {discount > 0 && (
          <span className="text-red-600">Save {discount}%</span>
        )}
      </div>
    </>
  );
}

/**
 * OPTION 3: Complete Real-World Example
 * =======================================
 * This shows a complete integration with all features
 */

'use client';

import { useMemo, useState, useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';

interface CompleteProductDetailsProps {
  product: {
    _id: string;
    title: string;
    description?: string;
    category: string;
    basePrice: number;
    offerPrice?: number;
    rating?: number;
    numReviews?: number;
    images?: Array<{ url: string }>;
    variants?: Array<{
      size: string;
      color: string;
      stock?: number;
      price?: number;
    }>;
    slug: string;
    sku?: string;
  };
  reviews?: any[];
}

export function CompleteProductDetailsExample({
  product,
  reviews = [],
}: CompleteProductDetailsProps) {
  // 1. Use the schema hook to get formatted data
  const { schemaData, isInStock, stockCount, colors, sizes, discount } =
    useProductSchema(product);

  // 2. Your existing component state
  const [selectedColor, setSelectedColor] = useState(colors[0] ?? '');
  const [selectedSize, setSelectedSize] = useState(sizes[0] ?? '');
  const [activeImage, setActiveImage] = useState(0);
  const addToCart = useCartStore((state) => state.addToCart);

  // 3. Compute current variant
  const currentVariant = useMemo(() => {
    return product.variants?.find(
      (v) => v.color === selectedColor && v.size === selectedSize
    );
  }, [product.variants, selectedColor, selectedSize]);

  const displayPrice = currentVariant?.price || product.basePrice;
  const displayOfferPrice = currentVariant?.price || product.offerPrice || 0;

  // 4. Main JSX
  return (
    <>
      {/* ============= CRITICAL: Add Schema Markup Here ============= */}
      <ProductSchemaMarkup
        product={schemaData}
        baseUrl="https://assidrat.com"
      />
      {/* ============================================================ */}

      <div className="container mx-auto px-4 py-8">
        {/* Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Main Image */}
          <div className="flex flex-col gap-4">
            <div className="w-full bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={product.images?.[activeImage]?.url || '/placeholder.jpg'}
                alt={product.title}
                className="w-full h-auto object-cover"
              />
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2">
              {product.images?.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-20 h-20 border rounded ${
                    activeImage === idx ? 'border-black' : 'border-gray-300'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={`Thumb ${idx}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-bold">{product.title}</h1>
              <p className="text-gray-600 mt-2">{product.description}</p>
            </div>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-2">
                <span className="text-yellow-500">★</span>
                <span className="font-semibold">{product.rating}/5</span>
                <span className="text-gray-500">
                  ({product.numReviews || 0} reviews)
                </span>
              </div>
            )}

            {/* Pricing */}
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-red-600">
                ৳{displayOfferPrice.toLocaleString()}
              </span>
              {displayOfferPrice < displayPrice && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    ৳{displayPrice.toLocaleString()}
                  </span>
                  {discount > 0 && (
                    <span className="bg-red-600 text-white px-2 py-1 rounded">
                      Save {discount}%
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Stock Status */}
            {isInStock ? (
              <div className="text-green-600 font-semibold">
                ✓ In Stock ({stockCount} available)
              </div>
            ) : (
              <div className="text-red-600 font-semibold">✗ Out of Stock</div>
            )}

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Color: {selectedColor}
              </label>
              <div className="flex gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full border-2 ${
                      selectedColor === color ? 'border-black' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color.toLowerCase() }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <label className="block text-sm font-semibold mb-2">Size</label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                {sizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            {/* Add to Cart */}
            <button
              onClick={() =>
                addToCart({
                  _id: product._id,
                  title: product.title,
                  price: displayOfferPrice,
                  image: product.images?.[0]?.url || '/placeholder.jpg',
                  selectedColor: selectedColor,
                  selectedSize: selectedSize,
                })
              }
              disabled={!isInStock}
              className={`w-full py-3 rounded font-bold text-white ${
                isInStock ? 'bg-black hover:bg-gray-800' : 'bg-gray-400'
              }`}
            >
              {isInStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div className="mt-12 border-t pt-8">
            <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="border rounded p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{review.name}</p>
                      <div className="flex gap-1">
                        {Array(review.rating)
                          .fill(0)
                          .map((_, i) => (
                            <span key={i} className="text-yellow-500">
                              ★
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 mt-2">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ============================================================================
// USAGE INSTRUCTIONS
// ============================================================================

/**
 * To use this in your actual ProductDetailsClient:
 *
 * 1. Import the component:
 *    import ProductSchemaMarkup from '@/components/seo/ProductSchemaMarkup';
 *    import { useProductSchema } from '@/lib/schema/useProductSchema';
 *
 * 2. Add at the top of your return statement:
 *    <ProductSchemaMarkup
 *      product={{
 *        id: product._id,
 *        title: product.title,
 *        description: product.description || '',
 *        slug: product.slug,
 *        basePrice: product.basePrice,
 *        offerPrice: product.offerPrice,
 *        sku: product.sku,
 *        category: product.category,
 *        images: product.images || [],
 *        rating: product.rating,
 *        numReviews: product.numReviews,
 *        variants: product.variants,
 *        brand: 'AS SIDRAT',
 *      }}
 *      baseUrl="https://assidrat.com"
 *    />
 *
 * 3. Test with Google Rich Results Test:
 *    https://search.google.com/test/rich-results
 *
 * 4. The component automatically:
 *    - Generates JSON-LD schema
 *    - Handles pricing and discounts
 *    - Checks stock availability
 *    - Includes ratings/reviews
 *    - Formats data for social media
 */
