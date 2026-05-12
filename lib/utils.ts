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
