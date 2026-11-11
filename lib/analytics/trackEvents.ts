'use client';

import { getMetaIdentifiers, getVisitorId } from '@/lib/analytics/attribution';

/**
 * Standardized E-commerce Analytics Helper for Meta Pixel & Google Analytics 4
 * Compliant with Meta Pixel Event Specifications (https://developers.facebook.com/docs/meta-pixel/reference)
 */

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    __fbqBuffer?: any[][];
    __sidPvId?: string;
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

/** Unique id shared by the browser Pixel event and its server-side Conversions API twin. */
export function newEventId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 10)}`;
}

/**
 * Id of the initial PageView fired by the base Pixel snippet. The snippet (AnalyticsScripts) and
 * the tracker both call this so the browser and server PageView carry the same event_id.
 */
export function getInitialPageViewId(): string {
  if (typeof window === 'undefined') return '';
  if (!window.__sidPvId) window.__sidPvId = newEventId('pv');
  return window.__sidPvId;
}

/**
 * Safe Pixel call.
 *
 * IMPORTANT: this must NEVER create a fake `window.fbq`. The official base snippet starts with
 * `if (f.fbq) return;` - if a stub already exists, fbevents.js is never downloaded and the Pixel
 * is dead for the whole session. Calls made before the Pixel is ready go into our own buffer,
 * which the base snippet flushes right after `fbq('init')`.
 */
function safeFbq(...args: any[]) {
  if (typeof window === 'undefined') return;
  try {
    if (typeof window.fbq === 'function') {
      window.fbq(...args);
    } else {
      (window.__fbqBuffer = window.__fbqBuffer || []).push(args);
    }
  } catch (err) {
    console.warn('[Meta Pixel] Event tracking warning:', err);
  }
}

/** GA4: use the official dataLayer queue so early events are replayed once gtag.js loads. */
function safeGtag(...args: any[]) {
  if (typeof window === 'undefined') return;
  try {
    if (typeof window.gtag === 'function') {
      window.gtag(...args);
    } else {
      window.dataLayer = window.dataLayer || [];
      // gtag.js expects the `arguments` object, not an array
      (function (..._a: any[]) {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer!.push(arguments);
      })(...args);
    }
  } catch {
    /* ignore */
  }
}

/** Fire a Pixel event with an eventID and mirror it to Conversions API through /api/meta/events. */
function fireMeta(eventName: string, params: Record<string, any>, opts: { eventId?: string; relay?: boolean } = {}) {
  const eventId = opts.eventId || newEventId(eventName.toLowerCase());
  safeFbq('track', eventName, params, { eventID: eventId });
  if (opts.relay !== false) relayToCapi(eventName, eventId, params);
  return eventId;
}

function relayToCapi(eventName: string, eventId: string, customData?: Record<string, any>) {
  if (typeof window === 'undefined') return;
  try {
    const { fbp, fbc } = getMetaIdentifiers();
    fetch('/api/meta/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName,
        eventId,
        eventSourceUrl: window.location.href.slice(0, 500),
        visitorId: getVisitorId(),
        fbp,
        fbc,
        customData,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* never break the UI for tracking */
  }
}

/**
 * Track PageView.
 *  - initial: true  -> the base Pixel snippet already fired the Pixel PageView for this load, so only
 *                      GA4 + the server-side twin (same event_id) are sent. This is what prevents the
 *                      double PageView that used to inflate view counts.
 *  - initial: false -> SPA navigation: fire Pixel + GA4 + server-side twin.
 */
export function trackPageView(url?: string, opts: { initial?: boolean } = {}) {
  if (typeof window === 'undefined') return;

  const currentUrl = url || window.location.pathname;
  let eventId: string;

  if (opts.initial) {
    eventId = getInitialPageViewId();
  } else {
    eventId = newEventId('pv');
    safeFbq('track', 'PageView', {}, { eventID: eventId });
  }
  relayToCapi('PageView', eventId);

  safeGtag('event', 'page_view', {
    page_location: window.location.href,
    page_path: currentUrl,
  });
}

const itemId = (item: AnalyticsItem) => String(item.id || item.title);

function ga4Items(items: AnalyticsItem[]) {
  return items.map((item) => ({
    item_id: itemId(item),
    item_name: item.title,
    item_category: item.category || 'Apparel',
    item_variant: [item.size, item.color].filter(Boolean).join(' / ') || undefined,
    price: Number(item.price) || 0,
    quantity: item.quantity || 1,
  }));
}

function metaContents(items: AnalyticsItem[]) {
  return items.map((item) => ({
    id: itemId(item),
    quantity: item.quantity || 1,
    item_price: Number(item.price) || 0,
  }));
}

/**
 * Runs `fn` only once for the same key inside the window (sessionStorage). Protects against
 * effects re-running (settings load, StrictMode) and the same step firing from two components.
 */
function onceWithin(key: string, windowMs: number): boolean {
  try {
    const k = `sid_once_${key}`;
    const last = Number(sessionStorage.getItem(k) || 0);
    if (last && Date.now() - last < windowMs) return false;
    sessionStorage.setItem(k, String(Date.now()));
    return true;
  } catch {
    return true;
  }
}

/**
 * Track Product View (ViewContent / view_item)
 */
export function trackViewContent(product: AnalyticsItem) {
  if (typeof window === 'undefined' || !product) return;

  const price = Number(product.price) || 0;
  const productId = itemId(product);

  // Same product within 30s = effect re-run, not a new view
  if (!onceWithin(`vc_${productId}`, 30_000)) return;

  fireMeta('ViewContent', {
    content_name: product.title,
    content_ids: [productId],
    content_type: 'product',
    value: price,
    currency: 'BDT',
    contents: [{ id: productId, quantity: 1, item_price: price }],
  });

  safeGtag('event', 'view_item', {
    currency: 'BDT',
    value: price,
    items: ga4Items([{ ...product, quantity: 1 }]),
  });
}

/**
 * Track Add to Cart (AddToCart / add_to_cart)
 */
export function trackAddToCart(product: AnalyticsItem, quantity: number = 1) {
  if (typeof window === 'undefined' || !product) return;

  const price = Number(product.price) || 0;
  const qty = Math.max(1, quantity);
  const productId = itemId(product);
  const totalValue = price * qty;

  fireMeta('AddToCart', {
    content_name: product.title,
    content_ids: [productId],
    content_type: 'product',
    value: totalValue,
    currency: 'BDT',
    contents: [{ id: productId, quantity: qty, item_price: price }],
  });

  safeGtag('event', 'add_to_cart', {
    currency: 'BDT',
    value: totalValue,
    items: ga4Items([{ ...product, quantity: qty }]),
  });
}

/**
 * Track Initiate Checkout (InitiateCheckout / begin_checkout).
 * De-duplicated per cart for 10 minutes: the cart drawer, the checkout page and landing-page
 * forms can all call this for the same checkout without double counting.
 */
export function trackInitiateCheckout(items: AnalyticsItem[], totalValue: number) {
  if (typeof window === 'undefined' || !items || items.length === 0) return;

  const signature = items.map((i) => `${itemId(i)}x${i.quantity || 1}`).sort().join('|');
  if (!onceWithin(`ic_${signature}`, 10 * 60_000)) return;

  const value = Number(totalValue) || 0;

  fireMeta('InitiateCheckout', {
    content_ids: items.map(itemId),
    content_type: 'product',
    num_items: items.reduce((acc, item) => acc + (item.quantity || 1), 0),
    value,
    currency: 'BDT',
    contents: metaContents(items),
  });

  safeGtag('event', 'begin_checkout', {
    currency: 'BDT',
    value,
    items: ga4Items(items),
  });
}

/**
 * Track Purchase (Purchase / purchase).
 * The server (/api/orders) sends the matching Conversions API Purchase with
 * event_id = purchase_<orderId>, so the browser event uses the same id and Meta de-duplicates.
 * No relay from the browser: the server event is the one with full customer data.
 */
export function purchaseEventId(orderId: string | number) {
  return `purchase_${orderId}`;
}

export function trackPurchase(orderId: string, items: AnalyticsItem[], totalValue: number) {
  if (typeof window === 'undefined' || !items) return;
  if (!onceWithin(`purchase_${orderId}`, 24 * 60 * 60_000)) return;

  const value = Number(totalValue) || 0;

  fireMeta(
    'Purchase',
    {
      content_ids: items.map(itemId),
      content_type: 'product',
      num_items: items.reduce((acc, item) => acc + (item.quantity || 1), 0),
      value,
      currency: 'BDT',
      order_id: String(orderId),
      contents: metaContents(items),
    },
    { eventId: purchaseEventId(orderId), relay: false }
  );

  safeGtag('event', 'purchase', {
    transaction_id: String(orderId),
    value,
    currency: 'BDT',
    items: ga4Items(items),
  });
}

/**
 * Track Contact / Lead (WhatsApp, Messenger, Phone calls)
 */
export function trackContact(details?: { productName?: string; price?: number; channel?: string }) {
  if (typeof window === 'undefined') return;

  const value = Number(details?.price) || 0;
  const name = details?.productName || 'Customer Inquiry';

  fireMeta('Contact', {
    content_name: name,
    value,
    currency: 'BDT',
  });

  // Lead for ads optimisation
  fireMeta('Lead', {
    content_name: name,
    value,
    currency: 'BDT',
  });

  safeGtag('event', 'generate_lead', {
    currency: 'BDT',
    value,
    contact_channel: details?.channel || 'WhatsApp',
  });
}

/**
 * Track Search (Search / search)
 */
export function trackSearch(searchQuery: string) {
  if (typeof window === 'undefined' || !searchQuery) return;

  fireMeta('Search', { search_string: searchQuery });
  safeGtag('event', 'search', { search_term: searchQuery });
}

/**
 * Track Add to Wishlist (AddToWishlist / add_to_wishlist)
 */
export function trackAddToWishlist(product: AnalyticsItem) {
  if (typeof window === 'undefined' || !product) return;

  const price = Number(product.price) || 0;
  const productId = itemId(product);

  fireMeta('AddToWishlist', {
    content_name: product.title,
    content_ids: [productId],
    content_type: 'product',
    value: price,
    currency: 'BDT',
  });

  safeGtag('event', 'add_to_wishlist', {
    currency: 'BDT',
    value: price,
    items: [{ item_id: productId, item_name: product.title, price }],
  });
}
