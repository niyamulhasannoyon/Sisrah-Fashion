/**
 * Ad attribution capture (UTM / fbclid / ad ids / _fbp / _fbc / in-app browser).
 *
 * Two layers are kept:
 *  - session touch : params seen in THIS browsing session (sessionStorage). Attached to analytics
 *                    events so "Meta Ads Traffic" only counts sessions that really came from an ad.
 *  - last / first  : localStorage, 7-day last-touch and 90-day first-touch. Attached to ORDERS
 *                    and Conversions API events so a purchase made later is still credited.
 *
 * No 'use client' directive on purpose: pure helpers (detectInAppBrowser) are also imported by
 * server route handlers. Everything touching window/document is guarded.
 */

export interface AttributionTouch {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  campaignId?: string;
  adsetId?: string;
  adId?: string;
  placement?: string;
  fbclid?: string;
  landingPage?: string;
  referrer?: string;
  isMetaAd?: boolean;
  capturedAt?: number;
}

export interface AttributionBundle {
  session: AttributionTouch | null;
  last: AttributionTouch | null;
  first: AttributionTouch | null;
  inAppBrowser: string;
  fbp: string;
  fbc: string;
}

const SESSION_KEY = 'sid_attr_session';
const LAST_KEY = 'sid_attr_last';
const FIRST_KEY = 'sid_attr_first';
const LAST_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const FIRST_TTL_MS = 90 * 24 * 60 * 60 * 1000;
const MAX_LEN = 200;

const META_SOURCES = /^(facebook|fb|instagram|ig|meta|messenger|an|audience_network|whatsapp)$/i;

/** Detects Facebook / Instagram / Messenger in-app browsers (they strip the referrer). */
export function detectInAppBrowser(ua: string = ''): string {
  if (!ua) return '';
  if (/Instagram/i.test(ua)) return 'Instagram';
  if (/FB_IAB\/MESSENGER|Orca-Android|MessengerForiOS|FBAN\/Messenger/i.test(ua)) return 'Messenger';
  if (/FBAN|FBAV|FB_IAB|FBIOS|FBSS/i.test(ua)) return 'Facebook';
  return '';
}

/** Ads Manager leaves `{{campaign.name}}` literally if the macro is mistyped. Treat as empty. */
function clean(v: string | null | undefined): string | undefined {
  if (!v) return undefined;
  const t = v.trim();
  if (!t || t.includes('{{') || t.includes('}}')) return undefined;
  return t.slice(0, MAX_LEN);
}

function readJson<T>(storage: Storage | undefined, key: string): T | null {
  try {
    const raw = storage?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(storage: Storage | undefined, key: string, value: unknown) {
  try {
    storage?.setItem(key, JSON.stringify(value));
  } catch {
    /* storage can be blocked in some in-app browsers */
  }
}

function fresh(t: AttributionTouch | null, ttl: number): AttributionTouch | null {
  if (!t || !t.capturedAt) return null;
  return Date.now() - t.capturedAt <= ttl ? t : null;
}

export function getCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : '';
}

function setCookie(name: string, value: string, days: number) {
  if (typeof document === 'undefined') return;
  try {
    const expires = new Date(Date.now() + days * 86400000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

function randomId(len = 16): string {
  return Math.random().toString(36).substring(2, 2 + len) + Math.random().toString(36).substring(2, 2 + len);
}

export function getVisitorId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let id = localStorage.getItem('loomra_visitor_id');
    if (!id) {
      id = 'vis_' + randomId(13);
      localStorage.setItem('loomra_visitor_id', id);
    }
    return id;
  } catch {
    return 'vis_' + randomId(13);
  }
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let id = sessionStorage.getItem('loomra_session_id');
    if (!id) {
      id = 'sess_' + randomId(13);
      sessionStorage.setItem('loomra_session_id', id);
    }
    return id;
  } catch {
    return 'sess_' + randomId(13);
  }
}

/**
 * Reads the current URL's tracking params. When present, stores them as the session touch and
 * refreshes last-touch / first-touch. Also writes a first-party `_fbc` cookie from fbclid when the
 * Pixel has not (yet) done so, so Conversions API events still carry click attribution.
 * Safe to call many times (idempotent per URL).
 */
export function captureAttribution(): AttributionTouch | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const fbclid = clean(params.get('fbclid'));
  const touch: AttributionTouch = {
    source: clean(params.get('utm_source')),
    medium: clean(params.get('utm_medium')),
    campaign: clean(params.get('utm_campaign')),
    content: clean(params.get('utm_content')),
    term: clean(params.get('utm_term')),
    campaignId: clean(params.get('campaign_id')),
    adsetId: clean(params.get('adset_id')),
    adId: clean(params.get('ad_id')),
    placement: clean(params.get('placement')),
    fbclid,
  };

  const hasParams = Object.values(touch).some(Boolean);

  // Persist the Meta click id as the _fbc cookie (format: fb.1.<timestamp>.<fbclid>)
  if (fbclid) {
    const existing = getCookie('_fbc');
    if (!existing || !existing.endsWith('.' + fbclid)) {
      setCookie('_fbc', `fb.1.${Date.now()}.${fbclid}`, 90);
    }
  }

  if (!hasParams) return readJson<AttributionTouch>(sessionStorage, SESSION_KEY);

  const full: AttributionTouch = {
    ...touch,
    landingPage: window.location.pathname,
    referrer: (document.referrer || '').slice(0, MAX_LEN),
    isMetaAd:
      !!fbclid ||
      !!(touch.source && META_SOURCES.test(touch.source)) ||
      !!touch.adId ||
      !!touch.adsetId ||
      !!touch.campaignId,
    capturedAt: Date.now(),
  };

  // Avoid rewriting on every client-side navigation that keeps the same query string
  const prev = readJson<AttributionTouch>(sessionStorage, SESSION_KEY);
  const same =
    prev && prev.fbclid === full.fbclid && prev.campaign === full.campaign && prev.adId === full.adId && prev.content === full.content;
  if (!same) {
    writeJson(sessionStorage, SESSION_KEY, full);
    writeJson(localStorage, LAST_KEY, full);
    if (!fresh(readJson<AttributionTouch>(localStorage, FIRST_KEY), FIRST_TTL_MS)) {
      writeJson(localStorage, FIRST_KEY, full);
    }
  }
  return full;
}

export function getMetaIdentifiers(): { fbp: string; fbc: string } {
  if (typeof window === 'undefined') return { fbp: '', fbc: '' };
  const fbp = getCookie('_fbp');
  let fbc = getCookie('_fbc');
  if (!fbc) {
    const last = fresh(readJson<AttributionTouch>(localStorage, LAST_KEY), LAST_TTL_MS);
    if (last?.fbclid) fbc = `fb.1.${last.capturedAt || Date.now()}.${last.fbclid}`;
  }
  return { fbp, fbc };
}

export function getAttribution(): AttributionBundle {
  if (typeof window === 'undefined') {
    return { session: null, last: null, first: null, inAppBrowser: '', fbp: '', fbc: '' };
  }
  const { fbp, fbc } = getMetaIdentifiers();
  return {
    session: readJson<AttributionTouch>(sessionStorage, SESSION_KEY),
    last: fresh(readJson<AttributionTouch>(localStorage, LAST_KEY), LAST_TTL_MS),
    first: fresh(readJson<AttributionTouch>(localStorage, FIRST_KEY), FIRST_TTL_MS),
    inAppBrowser: detectInAppBrowser(navigator.userAgent),
    fbp,
    fbc,
  };
}

/** Flat payload attached to analytics events (session-scoped touch only). */
export function getEventAttributionPayload() {
  const a = getAttribution();
  const s = a.session;
  return {
    utmSource: s?.source,
    utmMedium: s?.medium,
    utmCampaign: s?.campaign,
    utmContent: s?.content,
    utmTerm: s?.term,
    campaignId: s?.campaignId,
    adsetId: s?.adsetId,
    adId: s?.adId,
    placement: s?.placement,
    fbclid: s?.fbclid,
    landingPage: s?.landingPage,
    isMetaAd: !!s?.isMetaAd,
    inAppBrowser: a.inAppBrowser || undefined,
    fbp: a.fbp || undefined,
    fbc: a.fbc || undefined,
  };
}

/** Payload attached to an order: last touch (7d) with first touch (90d) as fallback + Meta ids. */
export function getOrderAttributionPayload() {
  const a = getAttribution();
  const t = a.last || a.session || a.first;
  return {
    source: t?.source,
    medium: t?.medium,
    campaign: t?.campaign,
    content: t?.content,
    term: t?.term,
    campaignId: t?.campaignId,
    adsetId: t?.adsetId,
    adId: t?.adId,
    placement: t?.placement,
    fbclid: t?.fbclid,
    landingPage: t?.landingPage,
    isMetaAd: !!t?.isMetaAd,
    firstSource: a.first?.source,
    firstMedium: a.first?.medium,
    firstCampaign: a.first?.campaign,
    firstAdId: a.first?.adId,
    firstTouchAt: a.first?.capturedAt,
    inAppBrowser: a.inAppBrowser || undefined,
    visitorId: getVisitorId(),
    fbp: a.fbp || undefined,
    fbc: a.fbc || undefined,
    eventSourceUrl: typeof window !== 'undefined' ? window.location.href.slice(0, 500) : undefined,
  };
}
