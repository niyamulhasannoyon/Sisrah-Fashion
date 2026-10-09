'use client';

/**
 * Standardized E-commerce Analytics Helper for Meta Pixel & Google Analytics 4
 * Compliant with Meta Pixel Event Specifications (https://developers.facebook.com/docs/meta-pixel/reference)
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
 * Safe helper to trigger FB Pixel events with queue fallback
 */
function safeFbq(...args: any[]) {
  if (typeof window === 'undefined') return;
  try {
    if (typeof window.fbq === 'function') {
      window.fbq(...args);
    } else {
      // Stub queue fallback if fbq is not yet loaded or initialized
      window.fbq = window.fbq || function () {
        (window.fbq as any).callMethod
          ? (window.fbq as any).callMethod.apply(window.fbq, arguments)
          : (window.fbq as any).queue.push(arguments);
      };
      (window.fbq as any).queue = (window.fbq as any).queue || [];
      window.fbq(...args);
    }
  } catch (err) {
    console.warn('[Meta Pixel] Event tracking warning:', err);
  }
}

/**
 * Track PageView event
 */
export function trackPageView(url?: string) {
  if (typeof window === 'undefined') return;

  const currentUrl = url || window.location.pathname;

  // Meta Pixel
  safeFbq('track', 'PageView');

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

  const price = Number(product.price) || 0;
  const productId = String(product.id || product.title);

  // Meta Pixel (Includes contents array for Meta Catalog Matching & Dynamic Ads)
  safeFbq('track', 'ViewContent', {
    content_name: product.title,
    content_ids: [productId],
    content_type: 'product',
    value: price,
    currency: 'BDT',
    contents: [{ id: productId, quantity: 1, item_price: price }],
  });

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

  const price = Number(product.price) || 0;
  const qty = Math.max(1, quantity);
  const productId = String(product.id || product.title);
  const totalValue = price * qty;

  // Meta Pixel
  safeFbq('track', 'AddToCart', {
    content_name: product.title,
    content_ids: [productId],
    content_type: 'product',
    value: totalValue,
    currency: 'BDT',
    contents: [{ id: productId, quantity: qty, item_price: price }],
  });

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
          quantity: qty,
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

  const contentIds = items.map((item) => String(item.id || item.title));
  const totalItemsCount = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const value = Number(totalValue) || 0;

  // Meta Pixel
  safeFbq('track', 'InitiateCheckout', {
    content_ids: contentIds,
    content_type: 'product',
    num_items: totalItemsCount,
    value: value,
    currency: 'BDT',
    contents: items.map((item) => ({
      id: String(item.id || item.title),
      quantity: item.quantity || 1,
      item_price: Number(item.price) || 0,
    })),
  });

  // Google Analytics 4
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'begin_checkout', {
      currency: 'BDT',
      value: value,
      items: items.map((item) => ({
        item_id: String(item.id || item.title),
        item_name: item.title,
        item_category: item.category || 'Apparel',
        price: Number(item.price) || 0,
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

  const contentIds = items.map((item) => String(item.id || item.title));
  const totalItemsCount = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const value = Number(totalValue) || 0;

  // Meta Pixel
  safeFbq('track', 'Purchase', {
    content_ids: contentIds,
    content_type: 'product',
    num_items: totalItemsCount,
    value: value,
    currency: 'BDT',
    order_id: String(orderId),
    contents: items.map((item) => ({
      id: String(item.id || item.title),
      quantity: item.quantity || 1,
      item_price: Number(item.price) || 0,
    })),
  });

  // Google Analytics 4
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'purchase', {
      transaction_id: String(orderId),
      value: value,
      currency: 'BDT',
      items: items.map((item) => ({
        item_id: String(item.id || item.title),
        item_name: item.title,
        item_category: item.category || 'Apparel',
        price: Number(item.price) || 0,
        quantity: item.quantity || 1,
      })),
    });
  }
}

/**
 * Track Contact / Lead (WhatsApp, Messenger, Phone calls)
 */
export function trackContact(details?: { productName?: string; price?: number; channel?: string }) {
  if (typeof window === 'undefined') return;

  const value = Number(details?.price) || 0;

  // Meta Pixel
  safeFbq('track', 'Contact', {
    content_name: details?.productName || 'Customer Inquiry',
    value: value,
    currency: 'BDT',
    channel: details?.channel || 'WhatsApp',
  });

  // Meta Pixel Lead event for Ads attribution
  safeFbq('track', 'Lead', {
    content_name: details?.productName || 'Customer Inquiry',
    value: value,
    currency: 'BDT',
  });

  // Google Analytics 4
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'generate_lead', {
      currency: 'BDT',
      value: value,
      contact_channel: details?.channel || 'WhatsApp',
    });
  }
}

/**
 * Track Search (Search / search)
 */
export function trackSearch(searchQuery: string) {
  if (typeof window === 'undefined' || !searchQuery) return;

  // Meta Pixel
  safeFbq('track', 'Search', {
    search_string: searchQuery,
  });

  // Google Analytics 4
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'search', {
      search_term: searchQuery,
    });
  }
}

/**
 * Track Add to Wishlist (AddToWishlist / add_to_wishlist)
 */
export function trackAddToWishlist(product: AnalyticsItem) {
  if (typeof window === 'undefined' || !product) return;

  const price = Number(product.price) || 0;
  const productId = String(product.id || product.title);

  // Meta Pixel
  safeFbq('track', 'AddToWishlist', {
    content_name: product.title,
    content_ids: [productId],
    content_type: 'product',
    value: price,
    currency: 'BDT',
  });

  // GA4
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'add_to_wishlist', {
      currency: 'BDT',
      value: price,
      items: [{ item_id: productId, item_name: product.title, price }],
    });
  }
}
