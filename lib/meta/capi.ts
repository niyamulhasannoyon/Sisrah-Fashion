import { createHash } from 'crypto';
import { getCachedSettings } from '@/lib/dataCache';

/**
 * Server-side Meta Conversions API helper.
 *
 * Env:
 *  META_CAPI_ACCESS_TOKEN  (required to send; without it every call is a safe no-op)
 *  META_PIXEL_ID           (optional; falls back to NEXT_PUBLIC_FACEBOOK_PIXEL_ID, then admin settings)
 *  META_GRAPH_API_VERSION  (optional; default v26.0)
 *  META_TEST_EVENT_CODE    (optional; Events Manager -> Test events. Remove in production)
 */

const GRAPH_VERSION = (process.env.META_GRAPH_API_VERSION || 'v26.0').trim();

export const CLIENT_RELAY_EVENTS = new Set([
  'PageView',
  'ViewContent',
  'AddToCart',
  'InitiateCheckout',
  'AddToWishlist',
  'Search',
  'Contact',
  'Lead',
]);

export interface CapiUserInput {
  email?: string;
  phone?: string;
  name?: string;
  city?: string;
  externalId?: string;
  fbp?: string;
  fbc?: string;
  ip?: string;
  userAgent?: string;
}

export interface CapiEventInput {
  eventName: string;
  eventId: string;
  eventSourceUrl?: string;
  eventTime?: number;
  user: CapiUserInput;
  customData?: Record<string, unknown>;
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function norm(value?: string): string {
  return (value || '').trim().toLowerCase();
}

/** Bangladesh numbers -> digits with country code, e.g. 01712345678 -> 8801712345678 */
export function normalizePhone(phone?: string): string {
  let d = (phone || '').replace(/\D/g, '');
  if (!d) return '';
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('880')) return d;
  if (d.startsWith('0')) return '880' + d.slice(1);
  if (d.length === 10 && d.startsWith('1')) return '880' + d;
  return d;
}

export function buildUserData(u: CapiUserInput) {
  const data: Record<string, unknown> = {};
  const email = norm(u.email);
  if (email && email.includes('@')) data.em = [sha256(email)];

  const phone = normalizePhone(u.phone);
  if (phone) data.ph = [sha256(phone)];

  const parts = norm(u.name).split(/\s+/).filter(Boolean);
  if (parts[0]) data.fn = [sha256(parts[0])];
  if (parts.length > 1) data.ln = [sha256(parts[parts.length - 1])];

  const city = norm(u.city).replace(/[^\p{L}]/gu, '');
  if (city) data.ct = [sha256(city)];

  data.country = [sha256('bd')];

  if (u.externalId) data.external_id = [sha256(u.externalId)];
  if (u.ip) data.client_ip_address = u.ip;
  if (u.userAgent) data.client_user_agent = u.userAgent;
  if (u.fbp) data.fbp = u.fbp;
  if (u.fbc) data.fbc = u.fbc;
  return data;
}

async function resolvePixelId(): Promise<string> {
  const fromEnv = (process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || '').trim();
  if (fromEnv) return fromEnv;
  try {
    const settings = await getCachedSettings();
    return (settings?.facebookPixelId || '').trim();
  } catch {
    return '';
  }
}

/** Pulls the real client IP / UA out of request headers (Vercel sets x-forwarded-for / x-real-ip). */
export function getRequestClientInfo(headers: Headers) {
  const ip =
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    headers.get('x-real-ip') ||
    '';
  return { ip, userAgent: headers.get('user-agent') || '' };
}

export async function sendCapiEvents(events: CapiEventInput[]): Promise<{ sent: boolean; reason?: string }> {
  const token = (process.env.META_CAPI_ACCESS_TOKEN || '').trim();
  if (!token) return { sent: false, reason: 'META_CAPI_ACCESS_TOKEN not set' };

  const pixelId = await resolvePixelId();
  if (!pixelId) return { sent: false, reason: 'No Pixel ID configured' };

  const now = Math.floor(Date.now() / 1000);
  const body: Record<string, unknown> = {
    data: events.map((e) => ({
      event_name: e.eventName,
      event_time: e.eventTime || now,
      event_id: e.eventId,
      action_source: 'website',
      event_source_url: e.eventSourceUrl,
      user_data: buildUserData(e.user),
      custom_data: e.customData,
    })),
    access_token: token,
  };
  const testCode = (process.env.META_TEST_EVENT_CODE || '').trim();
  if (testCode) body.test_event_code = testCode;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('[Meta CAPI] Rejected', res.status, text.slice(0, 500));
      return { sent: false, reason: `HTTP ${res.status}` };
    }
    return { sent: true };
  } catch (err: any) {
    console.error('[Meta CAPI] Request failed:', err?.message);
    return { sent: false, reason: err?.message || 'request failed' };
  } finally {
    clearTimeout(timer);
  }
}
