import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import dbConnect from '@/lib/dbConnect';
import AnalyticsEvent from '@/models/AnalyticsEvent';
import { analyticsLimiter } from '@/lib/rateLimiter';
import { detectInAppBrowser } from '@/lib/analytics/attribution';

export const dynamic = 'force-dynamic';
export const maxDuration = 15;

const clip = (v: unknown, max = 200): string | undefined =>
  typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : undefined;

/** Country / city from Vercel's edge geo headers (works inside in-app browsers, no 3rd-party call). */
function geoFromHeaders(req: Request) {
  let country = '';
  const code = req.headers.get('x-vercel-ip-country');
  if (code) {
    try {
      country = new Intl.DisplayNames(['en'], { type: 'region' }).of(code.toUpperCase()) || code;
    } catch {
      country = code;
    }
  }
  let city = req.headers.get('x-vercel-ip-city') || '';
  try { city = decodeURIComponent(city); } catch {}
  return { country, city };
}

/**
 * Anonymizes an IP address for privacy compliance (GDPR).
 */
function anonymizeIp(ip: string): string {
  if (!ip || ip === '127.0.0.1') return ip;
  const salt = process.env.ANALYTICS_IP_SALT || 'default-salt';
  return createHash('sha256').update(ip + salt).digest('hex').substring(0, 16);
}

// Lightweight UA Parser
function parseUA(ua: string) {
  let browser = 'Unknown';
  let os = 'Unknown';
  let device = 'Desktop';

  if (!ua) return { browser, os, device };

  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('SamsungBrowser')) browser = 'Samsung Browser';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Trident') || ua.includes('MSIE')) browser = 'Internet Explorer';
  else if (ua.includes('Edge') || ua.includes('Edg')) browser = 'Edge';

  if (ua.includes('Windows NT')) os = 'Windows';
  else if (ua.includes('Macintosh') || ua.includes('Mac OS X')) os = 'macOS';
  else if (ua.includes('Android')) {
    os = 'Android';
    device = 'Mobile';
  } else if (ua.includes('iPhone') || ua.includes('iPad')) {
    os = 'iOS';
    device = ua.includes('iPad') ? 'Tablet' : 'Mobile';
  } else if (ua.includes('Linux')) os = 'Linux';

  if (device !== 'Mobile' && device !== 'Tablet') {
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|PlayBook|Opera M(obi|ini)/.test(ua)) {
      device = 'Mobile';
    }
  }

  return { browser, os, device };
}

// Throttled warning log tracker
let lastDegradedLog = 0;

export async function POST(req: Request) {
  // 1. Ingress Rate Limiting (Prevents scraping bots from flooding DB writes)
  const limitCheck = analyticsLimiter.check(req);
  if (limitCheck.blocked) {
    return limitCheck.response!;
  }

  try {
    const body = await req.json().catch(() => ({}));
    const {
      eventType,
      url,
      sessionId,
      referrer,
      ip: clientIp,
      country,
      city,
      clickTarget,
      clickText,
      userId,
      visitorId,
    } = body;

    if (!eventType || !url || !sessionId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const serverIp =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      '';
    const rawIp = serverIp || clientIp || '127.0.0.1';
    const finalIp = anonymizeIp(rawIp);

    const userAgent = req.headers.get('user-agent') || '';
    const parsedUA = parseUA(userAgent);
    const inApp = detectInAppBrowser(userAgent) || clip(body.inAppBrowser, 30) || '';
    const geo = geoFromHeaders(req);

    // 2. Bulkhead Isolation with Strict Fast-Fail Timeout (5s max)
    // Analytics must NEVER block the system or hold DB connections if under load
    const savePromise = (async () => {
      await dbConnect();
      return AnalyticsEvent.create({
        eventType,
        url,
        referrer,
        ip: finalIp,
        country: geo.country || clip(country, 80) || 'Local / Dev',
        city: geo.city || clip(city, 80) || 'Local / Dev',
        browser: inApp ? `${inApp} In-App` : parsedUA.browser,
        os: parsedUA.os,
        device: parsedUA.device,
        clickTarget,
        clickText,
        userId: userId || null,
        sessionId,
        visitorId: clip(visitorId, 100),
        utmSource: clip(body.utmSource),
        utmMedium: clip(body.utmMedium),
        utmCampaign: clip(body.utmCampaign),
        utmContent: clip(body.utmContent),
        utmTerm: clip(body.utmTerm),
        campaignId: clip(body.campaignId, 100),
        adsetId: clip(body.adsetId, 100),
        adId: clip(body.adId, 100),
        placement: clip(body.placement, 100),
        fbclid: clip(body.fbclid, 300),
        fbp: clip(body.fbp, 100),
        fbc: clip(body.fbc, 300),
        landingPage: clip(body.landingPage, 300),
        isMetaAd: body.isMetaAd === true,
        inAppBrowser: inApp,
      });
    })();

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Analytics DB write timeout')), 5000)
    );

    const event = await Promise.race([savePromise, timeoutPromise]);
    return NextResponse.json({ success: true, eventId: event._id });
  } catch (error: any) {
    // 3. Graceful Degradation / Soft Drop under DB pressure
    // Log at most once every 10 seconds to prevent log saturation
    const now = Date.now();
    if (now - lastDegradedLog > 10_000) {
      console.warn('[Analytics Soft-Drop] Event dropped due to database load or timeout:', error?.message);
      lastDegradedLog = now;
    }

    // Always return HTTP 202 (Accepted) so frontend navigation is NEVER blocked or broken
    return NextResponse.json(
      { success: true, degraded: true, note: 'Event accepted with soft-drop under high load' },
      { status: 202 }
    );
  }
}

