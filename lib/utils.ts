import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names with Tailwind merge capabilities.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats monetary amounts to BDT currency representation.
 */
export function formatCurrency(value: number): string {
  return `৳${value.toLocaleString('en-BD')}`;
}

/**
 * Estimates delivery charges based on destination zone.
 */
export function estimateShippingCharge(location: 'dhaka' | 'outside'): number {
  return location === 'dhaka' ? 60 : 120;
}

/**
 * Normalizes image URLs for direct CDN display (Google Drive & Cloudinary).
 */
export function getDirectImageLink(url: string | undefined | null): string {
  if (!url) return '';
  
  let fileId = '';
  const fileDMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch) {
    fileId = fileDMatch[1];
  } else {
    const idParamMatch = url.match(/drive\.google\.com\/.*[?&]id=([a-zA-Z0-9_-]+)/);
    if (idParamMatch) {
      fileId = idParamMatch[1];
    }
  }
  
  if (fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  if (url.includes('res.cloudinary.com') && url.includes('/upload/') && !url.includes('f_auto') && !url.includes('q_auto')) {
    return url.replace('/upload/', '/upload/f_auto,q_auto/');
  }

  return url;
}

/**
 * Strips raw markdown artifacts and symbols (*, **, _, #, `, -, etc.) to produce clean plain text.
 */
export function cleanMarkdownArtifacts(text: string): string {
  if (!text) return '';
  return text
    // Remove markdown bold/italic (**text**, *text*, __text__, _text_)
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Remove markdown headers (# Header, ## Header, etc.)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove blockquotes (> quote)
    .replace(/^>\s+/gm, '')
    // Remove inline code / code blocks (`code` or ```code```)
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
    // Remove markdown list bullets (* item, - item) at line starts
    .replace(/^[\*\-]\s+/gm, '')
    // Clean up any remaining stray markdown characters (*, _, `, #, ~)
    .replace(/[\*_`#~]/g, '')
    .trim();
}

