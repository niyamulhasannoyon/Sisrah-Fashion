import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return `৳${value.toLocaleString('en-BD')}`;
}

export function estimateShippingCharge(location: 'dhaka' | 'outside') {
  return location === 'dhaka' ? 60 : 120;
}

export function getDirectImageLink(url: string | undefined | null): string {
  if (!url) return '';
  
  // Extract file ID from different Google Drive link formats
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
  
  return url;
}
