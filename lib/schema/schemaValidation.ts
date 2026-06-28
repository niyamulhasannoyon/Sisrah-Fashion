/**
 * JSON-LD Product Schema Utilities
 * 
 * This file contains utilities for validating and generating JSON-LD schemas
 * for e-commerce products according to schema.org specifications.
 */

export interface SchemaValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates if a URL string is properly formatted
 */
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validates JSON-LD Product Schema
 * Checks for required fields and proper format according to schema.org
 */
export function validateProductSchema(schema: any): SchemaValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  if (!schema['@context']) {
    errors.push('Missing required field: @context');
  }

  if (schema['@context'] !== 'https://schema.org/') {
    warnings.push('Recommended @context is https://schema.org/');
  }

  if (!schema['@type'] || schema['@type'] !== 'Product') {
    errors.push('Missing or incorrect required field: @type should be "Product"');
  }

  if (!schema.name || typeof schema.name !== 'string') {
    errors.push('Missing or invalid required field: name (must be a string)');
  }

  if (!schema.description || typeof schema.description !== 'string') {
    errors.push('Missing or invalid required field: description (must be a string)');
  }

  if (!schema.image || !Array.isArray(schema.image) || schema.image.length === 0) {
    warnings.push('Missing or empty recommended field: image (should be an array)');
  }

  // Validate image URLs
  if (Array.isArray(schema.image)) {
    schema.image.forEach((img: string, idx: number) => {
      if (!isValidUrl(img)) {
        errors.push(`Invalid image URL at index ${idx}: ${img}`);
      }
    });
  }

  // Validate offers
  if (!schema.offers) {
    errors.push('Missing required field: offers');
  } else {
    if (schema.offers['@type'] !== 'Offer') {
      errors.push('Invalid offers structure: @type should be "Offer"');
    }

    if (!schema.offers.priceCurrency) {
      errors.push('Missing required field: offers.priceCurrency');
    }

    if (!schema.offers.price) {
      errors.push('Missing required field: offers.price');
    }

    if (!schema.offers.availability) {
      warnings.push('Missing recommended field: offers.availability');
    } else {
      const validAvailabilities = [
        'https://schema.org/InStock',
        'https://schema.org/OutOfStock',
        'https://schema.org/PreOrder',
        'https://schema.org/BackOrder',
      ];
      if (!validAvailabilities.includes(schema.offers.availability)) {
        errors.push(`Invalid offers.availability: must be one of ${validAvailabilities.join(', ')}`);
      }
    }

    if (!schema.offers.itemCondition) {
      warnings.push('Missing recommended field: offers.itemCondition');
    } else {
      const validConditions = [
        'https://schema.org/NewCondition',
        'https://schema.org/RefurbishedCondition',
        'https://schema.org/UsedCondition',
      ];
      if (!validConditions.includes(schema.offers.itemCondition)) {
        errors.push(`Invalid offers.itemCondition: must be one of ${validConditions.join(', ')}`);
      }
    }
  }

  // Validate brand
  if (!schema.brand) {
    warnings.push('Missing recommended field: brand');
  }

  // Validate ratings
  if (schema.aggregateRating) {
    if (!schema.aggregateRating.ratingValue || !schema.aggregateRating.reviewCount) {
      warnings.push('Incomplete aggregateRating: both ratingValue and reviewCount are recommended');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Logs schema validation results to console
 * Useful for development and debugging
 */
export function logSchemaValidation(schema: any, componentName: string = 'ProductSchema'): void {
  const result = validateProductSchema(schema);

  if (result.errors.length > 0) {
    console.error(`❌ Schema validation failed for ${componentName}:`);
    result.errors.forEach(err => console.error(`  - ${err}`));
  }

  if (result.warnings.length > 0) {
    console.warn(`⚠️  Schema warnings for ${componentName}:`);
    result.warnings.forEach(warn => console.warn(`  - ${warn}`));
  }

  if (result.valid && result.warnings.length === 0) {
    console.log(`✅ Schema validation passed for ${componentName}`);
  }
}

/**
 * Generates a proper price string for JSON-LD
 * Ensures price is a valid number string in local format
 */
export function formatPriceForSchema(price: number): string {
  return price.toFixed(2);
}

/**
 * Generates an ISO 8601 date string for future validity dates
 */
export function generatePriceValidityDate(daysFromNow: number = 30): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

/**
 * Determines schema.org ItemCondition based on product state
 */
export function getItemCondition(isRefurbished: boolean = false, isUsed: boolean = false): string {
  if (isRefurbished) return 'https://schema.org/RefurbishedCondition';
  if (isUsed) return 'https://schema.org/UsedCondition';
  return 'https://schema.org/NewCondition';
}

/**
 * Determines schema.org Availability based on stock level
 */
export function getAvailabilityStatus(stock: number | undefined, preOrder: boolean = false): string {
  if (preOrder) return 'https://schema.org/PreOrder';
  if (stock === undefined || stock > 0) return 'https://schema.org/InStock';
  return 'https://schema.org/OutOfStock';
}
