/**
 * useProductSchema Hook
 * 
 * Provides utilities for transforming product database objects
 * into proper schema markup format
 */

export interface DatabaseProduct {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  basePrice: number;
  offerPrice?: number;
  sku?: string;
  category?: string;
  tags?: string[];
  images?: Array<{
    url: string;
    public_id?: string;
  }>;
  variants?: Array<{
    size: string;
    color: string;
    stock?: number;
    price?: number;
    offerPrice?: number;
  }>;
  rating?: number;
  numReviews?: number;
  [key: string]: any; // Allow additional fields
}

export interface SchemaProductData {
  id?: string;
  title: string;
  description: string;
  slug: string;
  basePrice: number;
  offerPrice?: number;
  sku?: string;
  category?: string;
  images: Array<{
    url: string;
    public_id?: string;
  }>;
  rating?: number;
  numReviews?: number;
  variants?: Array<{
    size: string;
    color: string;
    stock: number;
  }>;
  brand?: string;
}

/**
 * Transforms a database product object into schema-ready format
 * Handles null/undefined fields gracefully
 */
export function transformProductForSchema(product: DatabaseProduct): SchemaProductData {
  return {
    id: product._id,
    title: product.title || 'Unknown Product',
    description: product.description || '',
    slug: product.slug,
    basePrice: product.basePrice ?? 0,
    offerPrice: product.offerPrice,
    sku: product.sku,
    category: product.category,
    images: product.images || [],
    rating: product.rating,
    numReviews: product.numReviews,
    variants: product.variants?.map(v => ({
      size: v.size,
      color: v.color,
      stock: v.stock ?? 0,
    })),
    brand: 'AS SIDRAT',
  };
}

/**
 * Checks if a product has valid stock
 * Considers all variants
 */
export function hasValidStock(product: DatabaseProduct): boolean {
  if (!product.variants || product.variants.length === 0) {
    return true; // Assume in stock if no variants
  }
  return product.variants.some(v => (v.stock ?? 0) > 0);
}

/**
 * Gets total stock across all variants
 */
export function getTotalStock(product: DatabaseProduct): number {
  if (!product.variants) return 0;
  return product.variants.reduce((total, v) => total + (v.stock ?? 0), 0);
}

/**
 * Gets available colors from variants
 */
export function getAvailableColors(product: DatabaseProduct): string[] {
  if (!product.variants) return [];
  return [...new Set(product.variants.map(v => v.color))];
}

/**
 * Gets available sizes from variants
 */
export function getAvailableSizes(product: DatabaseProduct): string[] {
  if (!product.variants) return [];
  return [...new Set(product.variants.map(v => v.size))];
}

/**
 * Gets the lowest price across all variants
 */
export function getLowestPrice(product: DatabaseProduct): number {
  const prices: number[] = [];

  // Add variant prices if available
  if (product.variants) {
    product.variants.forEach(v => {
      if (v.offerPrice) prices.push(v.offerPrice);
      else if (v.price) prices.push(v.price);
    });
  }

  // Add base prices
  if (product.offerPrice) prices.push(product.offerPrice);
  if (product.basePrice) prices.push(product.basePrice);

  return prices.length > 0 ? Math.min(...prices) : product.basePrice;
}

/**
 * Gets the highest price across all variants
 */
export function getHighestPrice(product: DatabaseProduct): number {
  const prices: number[] = [];

  // Add variant prices if available
  if (product.variants) {
    product.variants.forEach(v => {
      if (v.price) prices.push(v.price);
      if (v.offerPrice && v.offerPrice > (v.price ?? 0)) prices.push(v.offerPrice);
    });
  }

  // Add base prices
  if (product.basePrice) prices.push(product.basePrice);
  if (product.offerPrice) prices.push(product.offerPrice);

  return prices.length > 0 ? Math.max(...prices) : product.basePrice;
}

/**
 * Calculates discount percentage
 */
export function getDiscountPercentage(basePrice: number, offerPrice?: number): number {
  if (!offerPrice || offerPrice >= basePrice) return 0;
  return Math.round(((basePrice - offerPrice) / basePrice) * 100);
}

/**
 * Generates a SKU if not provided
 * Format: CATEGORY-SLUG-ID
 */
export function generateSKU(product: DatabaseProduct): string {
  if (product.sku) return product.sku;

  const category = (product.category || 'PROD').substring(0, 3).toUpperCase();
  const slug = (product.slug || 'unknown').substring(0, 5).toUpperCase();
  const id = product._id.toString().slice(-6).toUpperCase();

  return `${category}-${slug}-${id}`;
}

/**
 * React Hook: useProductSchema
 * 
 * Usage:
 * ```
 * const { schemaData, isInStock, stockCount } = useProductSchema(product);
 * ```
 */
export function useProductSchema(product: DatabaseProduct) {
  const schemaData = transformProductForSchema(product);
  const isInStock = hasValidStock(product);
  const stockCount = getTotalStock(product);
  const colors = getAvailableColors(product);
  const sizes = getAvailableSizes(product);
  const lowestPrice = getLowestPrice(product);
  const highestPrice = getHighestPrice(product);
  const discount = getDiscountPercentage(product.basePrice, product.offerPrice);
  const sku = generateSKU(product);

  return {
    schemaData,
    isInStock,
    stockCount,
    colors,
    sizes,
    lowestPrice,
    highestPrice,
    discount,
    sku,
  };
}
