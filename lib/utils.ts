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
