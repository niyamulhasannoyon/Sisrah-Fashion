'use client';

/**
 * Standardized E-commerce Analytics Helper for Meta Pixel & Google Analytics 4
 */

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export interface AnalyticsItem {
  id?: string;
  title: string;
  price: number;
  quantity?: number;
  category?: string;
  size?: string;
  color?: string;
}

/**
 * Track PageView event
 */
export function trackPageView(url?: string) {
  if (typeof window === 'undefined') return;

  const currentUrl = url || window.location.pathname;

  // Meta Pixel
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'PageView');
  }

  // Google Analytics 4
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_location: window.location.href,
      page_path: currentUrl,
    });
  }
}

/**
 * Track Product View (ViewContent / view_item)
 */
export function trackViewContent(product: AnalyticsItem) {
  if (typeof window === 'undefined' || !product) return;

  const price = product.price || 0;
  const productId = product.id || product.title;

  // Meta Pixel
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'ViewContent', {
      content_name: product.title,
      content_ids: [productId],
      content_type: 'product',
      value: price,
      currency: 'BDT',
    });
  }

  // Google Analytics 4
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'view_item', {
      currency: 'BDT',
      value: price,
      items: [
        {
          item_id: productId,
          item_name: product.title,
          item_category: product.category || 'Apparel',
          price: price,
          quantity: 1,
        },
      ],
    });
  }
}

/**
 * Track Add to Cart (AddToCart / add_to_cart)
 */
export function trackAddToCart(product: AnalyticsItem, quantity: number = 1) {
  if (typeof window === 'undefined' || !product) return;

  const price = product.price || 0;
  const productId = product.id || product.title;
  const totalValue = price * quantity;

  // Meta Pixel
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'AddToCart', {
      content_name: product.title,
      content_ids: [productId],
      content_type: 'product',
      value: totalValue,
      currency: 'BDT',
    });
  }

  // Google Analytics 4
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'add_to_cart', {
      currency: 'BDT',
      value: totalValue,
      items: [
        {
          item_id: productId,
          item_name: product.title,
          item_category: product.category || 'Apparel',
          item_variant: [product.size, product.color].filter(Boolean).join(' / '),
          price: price,
          quantity: quantity,
        },
      ],
    });
  }
}

/**
 * Track Initiate Checkout (InitiateCheckout / begin_checkout)
 */
export function trackInitiateCheckout(items: AnalyticsItem[], totalValue: number) {
  if (typeof window === 'undefined' || !items || items.length === 0) return;

  const contentIds = items.map(item => item.id || item.title);

  // Meta Pixel
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'InitiateCheckout', {
      content_ids: contentIds,
      content_type: 'product',
      num_items: items.reduce((acc, item) => acc + (item.quantity || 1), 0),
      value: totalValue,
      currency: 'BDT',
    });
  }

  // Google Analytics 4
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'begin_checkout', {
      currency: 'BDT',
      value: totalValue,
      items: items.map(item => ({
        item_id: item.id || item.title,
        item_name: item.title,
        item_category: item.category || 'Apparel',
        price: item.price,
        quantity: item.quantity || 1,
      })),
    });
  }
}

/**
 * Track Purchase (Purchase / purchase)
 */
export function trackPurchase(orderId: string, items: AnalyticsItem[], totalValue: number) {
  if (typeof window === 'undefined' || !items) return;

  const contentIds = items.map(item => item.id || item.title);

  // Meta Pixel
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Purchase', {
      content_ids: contentIds,
      content_type: 'product',
      value: totalValue,
      currency: 'BDT',
      order_id: orderId,
    });
  }

  // Google Analytics 4
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'purchase', {
      transaction_id: orderId,
      value: totalValue,
      currency: 'BDT',
      items: items.map(item => ({
        item_id: item.id || item.title,
        item_name: item.title,
        item_category: item.category || 'Apparel',
        price: item.price,
        quantity: item.quantity || 1,
      })),
    });
  }
}
