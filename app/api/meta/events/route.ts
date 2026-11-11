import { NextResponse, after } from 'next/server';
import { metaEventsLimiter } from '@/lib/rateLimiter';
import { CLIENT_RELAY_EVENTS, getRequestClientInfo, sendCapiEvents } from '@/lib/meta/capi';

export const dynamic = 'force-dynamic';

const str = (v: unknown, max = 200) => (typeof v === 'string' ? v.slice(0, max) : undefined);

/** Whitelist + clamp custom_data coming from the browser. */
function sanitizeCustomData(raw: any): Record<string, unknown> {
  if (!raw || typeof raw !== 'object') return {};
  const out: Record<string, unknown> = {};
  if (typeof raw.value === 'number' && isFinite(raw.value)) out.value = raw.value;
  if (typeof raw.currency === 'string') out.currency = raw.currency.slice(0, 3).toUpperCase();
  if (typeof raw.content_name === 'string') out.content_name = raw.content_name.slice(0, 200);
  if (typeof raw.content_type === 'string') out.content_type = raw.content_type.slice(0, 40);
  if (typeof raw.search_string === 'string') out.search_string = raw.search_string.slice(0, 200);
  if (typeof raw.num_items === 'number') out.num_items = raw.num_items;
  if (Array.isArray(raw.content_ids)) out.content_ids = raw.content_ids.slice(0, 50).map((x: unknown) => String(x).slice(0, 80));
  if (Array.isArray(raw.contents)) {
    out.contents = raw.contents.slice(0, 50).map((c: any) => ({
      id: String(c?.id ?? '').slice(0, 80),
      quantity: Number(c?.quantity) || 1,
      item_price: Number(c?.item_price) || 0,
    }));
  }
  return out;
}

/**
 * Browser -> server relay for Conversions API.
 * The browser Pixel and this server event share the same event_id so Meta de-duplicates them.
 * Purchase is NOT accepted here; it is sent from /api/orders after the order is stored.
 */
export async function POST(req: Request) {
  const limit = metaEventsLimiter.check(req);
  if (limit.blocked) return limit.response!;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ success: false, error: 'Invalid body' }, { status: 400 });
  }

  const eventName = str(body.eventName, 40) || '';
  const eventId = str(body.eventId, 100) || '';
  if (!CLIENT_RELAY_EVENTS.has(eventName) || !eventId) {
    return NextResponse.json({ success: false, error: 'Unsupported event' }, { status: 400 });
  }

  const { ip, userAgent } = getRequestClientInfo(req.headers);

  // Run AFTER the response is sent. On Vercel a bare fire-and-forget fetch can be frozen once the
  // response returns; after() keeps the invocation alive until the Graph call finishes.
  after(async () => {
    await sendCapiEvents([
      {
        eventName,
        eventId,
        eventSourceUrl: str(body.eventSourceUrl, 500),
        user: {
          email: str(body.email),
          phone: str(body.phone, 30),
          externalId: str(body.visitorId, 100),
          fbp: str(body.fbp, 100),
          fbc: str(body.fbc, 200),
          ip,
          userAgent,
        },
        customData: sanitizeCustomData(body.customData),
      },
    ]);
  });

  return NextResponse.json({ success: true }, { status: 202 });
}
