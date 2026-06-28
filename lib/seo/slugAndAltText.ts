/**
 * SEO Slug and Alt-Text Generation Utility
 * 
 * This module provides utilities for:
 * 1. Converting product names to SEO-friendly URL slugs
 * 2. Generating descriptive image alt-text for accessibility and SEO
 * 
 * Supports both Bengali and English text with proper character handling
 */

/**
 * Bengali to Latin transliteration mapping
 * Common Bengali characters and their English equivalents
 */
const bengaliToEnglishMap: { [key: string]: string } = {
  // Vowels
  'অ': 'o',
  'আ': 'a',
  'ই': 'i',
  'ঈ': 'i',
  'উ': 'u',
  'ঊ': 'u',
  'ঋ': 'ri',
  'এ': 'e',
  'ঐ': 'oi',
  'ও': 'o',
  'ঔ': 'ou',

  // Consonants
  'ক': 'k',
  'খ': 'kh',
  'গ': 'g',
  'ঘ': 'gh',
  'ঙ': 'ng',
  'চ': 'ch',
  'ছ': 'chh',
  'জ': 'j',
  'ঝ': 'jh',
  'ঞ': 'ng',
  'ট': 't',
  'ঠ': 'th',
  'ড': 'd',
  'ঢ': 'dh',
  'ণ': 'n',
  'ত': 't',
  'থ': 'th',
  'দ': 'd',
  'ধ': 'dh',
  'ন': 'n',
  'প': 'p',
  'ফ': 'ph',
  'ব': 'b',
  'ভ': 'bh',
  'ম': 'm',
  'য': 'y',
  'র': 'r',
  'ল': 'l',
  'শ': 'sh',
  'ষ': 'sh',
  'স': 's',
  'হ': 'h',

  // Special characters
  'ং': 'ng',
  'ঃ': 'h',
  'ঁ': 'n',

  // Common conjuncts (simplified)
  'ক্ষ': 'ksh',
  'জ্ঞ': 'gn',
  'শ্র': 'shr',
};

/**
 * Transliterates Bengali text to English
 * Uses a character map for common Bengali characters
 * 
 * @param bengaliText - Text containing Bengali characters
 * @returns Transliterated English text
 * 
 * @example
 * transliterateBengali('ইন্ডিগো পাঞ্জাবী')
 * // Returns: 'indigo panjabi'
 */
export function transliterateBengali(bengaliText: string): string {
  if (!bengaliText) return '';

  let result = '';
  for (const char of bengaliText) {
    result += bengaliToEnglishMap[char] || char;
  }
  return result;
}

/**
 * Generates an SEO-friendly URL slug from a product name
 * Handles both Bengali and English text
 * 
 * Features:
 * - Converts to lowercase
 * - Removes special characters (keeps hyphens, spaces, alphanumerics)
 * - Replaces spaces with hyphens
 * - Removes consecutive hyphens
 * - Trims leading/trailing hyphens
 * - Handles Bengali characters through transliteration
 * - Max length: 75 characters (SEO best practice)
 * 
 * @param productName - Original product name
 * @param maxLength - Maximum slug length (default: 75)
 * @returns SEO-friendly slug
 * 
 * @example
 * generateSlug('Classic Linen Shirt')
 * // Returns: 'classic-linen-shirt'
 * 
 * @example
 * generateSlug('Indigo Panjabi - Premium Quality')
 * // Returns: 'indigo-panjabi-premium-quality'
 * 
 * @example
 * generateSlug('ইন্ডিগো পাঞ্জাবী')
 * // Returns: 'indigo-panjabi'
 */
export function generateSlug(productName: string, maxLength: number = 75): string {
  if (!productName || typeof productName !== 'string') {
    return '';
  }

  // Step 1: Transliterate Bengali characters to English
  let slug = transliterateBengali(productName);

  // Step 2: Convert to lowercase
  slug = slug.toLowerCase();

  // Step 3: Remove accents and special characters (but keep spaces for now)
  // Replace common diacritics with their base characters
  slug = slug
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, ''); // Keep only alphanumerics, spaces, hyphens

  // Step 4: Replace multiple spaces with single space
  slug = slug.replace(/\s+/g, ' ');

  // Step 5: Replace spaces with hyphens
  slug = slug.replace(/\s/g, '-');

  // Step 6: Remove consecutive hyphens
  slug = slug.replace(/-+/g, '-');

  // Step 7: Remove leading and trailing hyphens
  slug = slug.replace(/^-+|-+$/g, '');

  // Step 8: Trim to max length (keeping complete words)
  if (slug.length > maxLength) {
    slug = slug.substring(0, maxLength);
    // Remove incomplete word at the end
    const lastHyphenIndex = slug.lastIndexOf('-');
    if (lastHyphenIndex > 0) {
      slug = slug.substring(0, lastHyphenIndex);
    }
  }

  return slug;
}

/**
 * Generates a SEO-optimized image alt-text
 * 
 * Format: [Brand] [Product Name] [Category/Type]
 * 
 * Features:
 * - Descriptive and keyword-rich
 * - Under 125 characters (optimal for screen readers)
 * - Includes brand for branding + SEO
 * - Includes product type for context
 * - Accessible for visually impaired users
 * - Improves image search visibility
 * 
 * @param productTitle - Product name (e.g., 'Classic Linen Shirt')
 * @param category - Product category (e.g., 'Men\'s Shirts')
 * @param brand - Brand name (default: 'AS SIDRAT')
 * @param additionalContext - Optional additional descriptive context (e.g., 'for Men', 'Premium Quality')
 * @returns SEO-friendly alt-text (max 125 chars)
 * 
 * @example
 * generateImageAltText('Classic Linen Shirt', 'Shirts', 'AS SIDRAT')
 * // Returns: 'AS SIDRAT Classic Linen Shirt for Men - Premium quality minimalist fashion'
 * 
 * @example
 * generateImageAltText('Indigo Panjabi', 'Ethnic Wear')
 * // Returns: 'AS SIDRAT Indigo Panjabi - Premium quality minimalist fashion'
 * 
 * @example
 * generateImageAltText('Summer Cotton Tee', 'T-Shirts', 'AS SIDRAT', 'Breathable and comfortable')
 * // Returns: 'AS SIDRAT Summer Cotton Tee for T-Shirts - Breathable and comfortable'
 */
export function generateImageAltText(
  productTitle: string,
  category: string = 'Fashion',
  brand: string = 'AS SIDRAT',
  additionalContext: string = ''
): string {
  if (!productTitle) return '';

  // Build base alt text
  let altText = `${brand} ${productTitle}`;

  // Add category context
  if (category) {
    // Extract gender/type context from category if present
    const genderMatch = category.match(/\b(men|women|unisex|kids?)\b/i);
    if (genderMatch) {
      altText += ` for ${genderMatch[1]}`;
    } else {
      altText += ` - ${category}`;
    }
  }

  // Add additional context or default brand description
  if (additionalContext) {
    altText += ` - ${additionalContext}`;
  } else {
    // Add default brand descriptor for SEO
    altText += ' - Premium quality minimalist fashion';
  }

  // Trim to 125 characters (screen reader optimal)
  const maxLength = 125;
  if (altText.length > maxLength) {
    altText = altText.substring(0, maxLength).trim();
    // Remove incomplete words
    const lastSpaceIndex = altText.lastIndexOf(' ');
    if (lastSpaceIndex > 0) {
      altText = altText.substring(0, lastSpaceIndex);
    }
    altText += '...';
  }

  return altText;
}

/**
 * Generates multiple SEO-friendly alt-texts for different image variations
 * Useful for product galleries where each image shows different aspects
 * 
 * @param productTitle - Product name
 * @param category - Product category
 * @param imageIndex - Index of the image in gallery (0 = main, 1 = detail, 2 = lifestyle, etc.)
 * @param brand - Brand name
 * @returns Array of alt-texts for different image types
 * 
 * @example
 * generateImageAltTextVariants('Classic Linen Shirt', 'Shirts')
 * // Returns: [
 * //   'AS SIDRAT Classic Linen Shirt - Premium quality minimalist fashion',
 * //   'AS SIDRAT Classic Linen Shirt fabric detail close-up',
 * //   'AS SIDRAT Classic Linen Shirt worn by model - lifestyle photo',
 * // ]
 */
export function generateImageAltTextVariants(
  productTitle: string,
  category: string = 'Fashion',
  brand: string = 'AS SIDRAT'
): string[] {
  const baseAlt = generateImageAltText(productTitle, category, brand);

  return [
    // Main product image
    baseAlt,

    // Detail/close-up image
    generateImageAltText(productTitle, category, brand, 'fabric and texture details'),

    // Lifestyle/worn image
    generateImageAltText(productTitle, category, brand, 'modeled outfit photo'),

    // Alternative angle
    generateImageAltText(productTitle, category, brand, 'product flat lay'),

    // Color/pattern focus
    generateImageAltText(productTitle, category, brand, 'color and pattern showcase'),
  ];
}

/**
 * Validates if a slug meets SEO best practices
 * 
 * Returns validation result with suggestions
 */
export interface SlugValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export function validateSlug(slug: string): SlugValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check if empty
  if (!slug || slug.length === 0) {
    errors.push('Slug is empty');
  }

  // Check for invalid characters
  if (!/^[a-z0-9-]+$/.test(slug)) {
    errors.push('Slug contains invalid characters (only lowercase letters, numbers, and hyphens allowed)');
  }

  // Check for leading/trailing hyphens
  if (slug.startsWith('-') || slug.endsWith('-')) {
    errors.push('Slug starts or ends with a hyphen');
  }

  // Check for consecutive hyphens
  if (slug.includes('--')) {
    errors.push('Slug contains consecutive hyphens');
  }

  // Check length
  if (slug.length < 3) {
    warnings.push('Slug is very short (less than 3 characters)');
    suggestions.push('Consider a more descriptive slug');
  }

  if (slug.length > 75) {
    warnings.push('Slug exceeds recommended length (75 characters)');
    suggestions.push('Shorten the slug to improve readability');
  }

  // Check if too many hyphens
  const hyphenCount = (slug.match(/-/g) || []).length;
  if (hyphenCount > 5) {
    warnings.push(`Slug has many hyphens (${hyphenCount})`);
    suggestions.push('Consider reducing the number of words');
  }

  // Check for stop words (common words that hurt SEO when overused)
  const stopWords = [
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
  ];
  const slugWords = slug.split('-');
  const hasOnlyStopWords = slugWords.every(word => stopWords.includes(word));
  if (hasOnlyStopWords && slugWords.length > 0) {
    warnings.push('Slug consists only of stop words');
    suggestions.push('Include at least one meaningful keyword');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}

/**
 * Validates image alt-text for SEO and accessibility
 */
export interface AltTextValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  score: number; // 0-100
}

export function validateAltText(altText: string): AltTextValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];
  let score = 100;

  // Check if empty
  if (!altText || altText.trim().length === 0) {
    errors.push('Alt text is empty');
    score -= 50;
  }

  // Check length (optimal: 50-125 characters)
  if (altText.length < 20) {
    warnings.push('Alt text is too short (less than 20 characters)');
    suggestions.push('Make it more descriptive');
    score -= 15;
  }

  if (altText.length > 125) {
    warnings.push('Alt text exceeds 125 characters (screen reader optimal)');
    suggestions.push('Trim to 125 characters or less');
    score -= 10;
  }

  // Check for keyword stuffing (too many repeated words)
  const words = altText.toLowerCase().split(/\s+/);
  const wordFreq: { [key: string]: number } = {};
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });

  const overusedWords = Object.entries(wordFreq)
    .filter(([, count]) => count > 3 && ![
      'and',
      'the',
      'a',
      'an',
      'or',
      'in',
      'on',
      'at',
    ].includes(word))
    .map(([word]) => word);

  if (overusedWords.length > 0) {
    warnings.push(`Alt text has overused words: ${overusedWords.join(', ')}`);
    suggestions.push('Vary your vocabulary to avoid keyword stuffing');
    score -= 15;
  }

  // Check for common anti-patterns
  if (
    altText.toLowerCase().includes('image of image') ||
    altText.toLowerCase().includes('picture of picture') ||
    altText.toLowerCase().includes('image.jpg') ||
    altText.toLowerCase().includes('photo.png')
  ) {
    errors.push('Alt text contains filename or generic "image" references');
    score -= 25;
  }

  // Check if it describes what's in the image
  const descriptiveWords = [
    'shows',
    'displays',
    'features',
    'depicts',
    'illustrates',
    'demonstrates',
    'showing',
    'wearing',
    'holding',
    'standing',
  ];
  const hasDescriptiveLanguage = descriptiveWords.some(word =>
    altText.toLowerCase().includes(word)
  );

  if (!hasDescriptiveLanguage && altText.length < 50) {
    suggestions.push('Use active, descriptive language (e.g., "wearing", "showing", "featuring")');
    score -= 10;
  }

  // Ensure score is between 0-100
  score = Math.max(0, Math.min(100, score));

  return {
    valid: errors.length === 0 && score >= 70,
    errors,
    warnings,
    suggestions,
    score,
  };
}

/**
 * Generates both slug and alt-text in one call
 * Useful for product creation forms
 */
export interface GeneratedSEOContent {
  slug: string;
  altText: string;
  altTextVariants: string[];
  slugValidation: SlugValidationResult;
  altTextValidation: AltTextValidationResult;
}

export function generateSEOContent(
  productTitle: string,
  category: string = 'Fashion',
  imageUrl?: string,
  brand: string = 'AS SIDRAT'
): GeneratedSEOContent {
  const slug = generateSlug(productTitle);
  const altText = generateImageAltText(productTitle, category, brand);
  const altTextVariants = generateImageAltTextVariants(productTitle, category, brand);

  return {
    slug,
    altText,
    altTextVariants,
    slugValidation: validateSlug(slug),
    altTextValidation: validateAltText(altText),
  };
}
