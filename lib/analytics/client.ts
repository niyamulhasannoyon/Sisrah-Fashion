import { getEventAttributionPayload, getSessionId, getVisitorId } from '@/lib/analytics/attribution';

/**
 * Single client-side entry point for first-party analytics events (/api/analytics/track).
 * Used by both the shop AnalyticsTracker and landing pages (which live outside the shop layout),
 * so session / visitor ids and attribution are always consistent.
 */
export function sendAnalyticsEvent(input: {
  eventType: 'pageview' | 'click';
  url: string;
  clickText?: string;
  clickTarget?: string;
  userId?: string | null;
}) {
  if (typeof window === 'undefined') return;
  const payload = {
    ...input,
    sessionId: getSessionId(),
    visitorId: getVisitorId(),
    referrer: document.referrer || '',
    userId: input.userId || null,
    ...getEventAttributionPayload(),
  };
  try {
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* never break the page for analytics */
  }
}
