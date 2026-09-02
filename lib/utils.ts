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
 * Normalizes image URLs for direct CDN display (Google Drive, Dropbox, Imgur, Cloudinary, etc.).
 */
export function getDirectImageLink(url: string | undefined | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // 1. Google Drive URLs (file/d/, open?id=, uc?id=, docs.google.com, lh3.googleusercontent.com/d/)
  const gDriveMatch = trimmed.match(
    /(?:drive\.google\.com\/(?:file\/d\/|(?:open|uc)\?(?:export=view&)?id=|.*[?&]id=)|docs\.google\.com\/file\/d\/|lh[0-9]\.googleusercontent\.com\/(?:u\/[0-9]+\/)?d\/)([a-zA-Z0-9_-]{15,})/
  );
  if (gDriveMatch && gDriveMatch[1]) {
    const fileId = gDriveMatch[1];
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  // 2. Dropbox share URLs -> Direct download/stream URLs
  if (trimmed.includes('dropbox.com')) {
    if (trimmed.includes('dl.dropboxusercontent.com')) {
      return trimmed;
    }
    return trimmed
      .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
      .replace('dropbox.com', 'dl.dropboxusercontent.com')
      .replace(/[?&]dl=[01]/g, '')
      .replace(/[?&]raw=1/g, '');
  }

  // 3. Imgur page links -> Direct image link
  const imgurMatch = trimmed.match(/^https?:\/\/(?:www\.)?imgur\.com\/([a-zA-Z0-9]{5,8})(?:\.[a-zA-Z]{3,4})?$/);
  if (imgurMatch && imgurMatch[1] && !trimmed.includes('i.imgur.com')) {
    return `https://i.imgur.com/${imgurMatch[1]}.jpg`;
  }

  // 4. Cloudinary auto-optimization
  if (trimmed.includes('res.cloudinary.com') && trimmed.includes('/upload/') && !trimmed.includes('f_auto') && !trimmed.includes('q_auto')) {
    return trimmed.replace('/upload/', '/upload/f_auto,q_auto/');
  }

  return trimmed;
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

