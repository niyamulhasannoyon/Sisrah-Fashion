'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { trackPageView } from '@/lib/analytics/trackEvents';
import { captureAttribution } from '@/lib/analytics/attribution';
import { sendAnalyticsEvent } from '@/lib/analytics/client';

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const lastPath = useRef<string | null>(null);
  const isFirstView = useRef(true);
  const userIdRef = useRef<string | null>(null);

  userIdRef.current = user?.id || null;

  // Global click tracking (country / city now come from Vercel geo headers on the server,
  // so the browser no longer calls a third-party IP API that the CSP blocked anyway).
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactiveEl = target.closest('a, button, [data-track-click]');
      if (!interactiveEl) return;

      const clickText = interactiveEl.textContent?.trim() || '';
      let destination = '';
      if (interactiveEl.tagName.toLowerCase() === 'a') {
        destination = (interactiveEl as HTMLAnchorElement).getAttribute('href') || '';
      }
      const tag = interactiveEl.tagName.toLowerCase();
      const targetSnippet = `<${tag} class="${interactiveEl.className}" id="${interactiveEl.id}">${clickText.substring(0, 30)}</${tag}>`;

      sendAnalyticsEvent({
        eventType: 'click',
        url: window.location.pathname,
        clickText: clickText || destination || 'Interactive Element',
        clickTarget: targetSnippet,
        userId: userIdRef.current,
      });
    };

    document.addEventListener('click', handleGlobalClick, true);
    return () => document.removeEventListener('click', handleGlobalClick, true);
  }, []);

  // Page views: initial load + client-side navigation
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const fullPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    if (lastPath.current === fullPath) return; // StrictMode / re-render guard
    lastPath.current = fullPath;

    // Must run BEFORE the first event so utm / fbclid / ad ids are attached to it
    captureAttribution();

    // The base Pixel snippet already fired the Pixel PageView on first load -> initial: true
    // skips it (this used to double count every first page view).
    trackPageView(fullPath, { initial: isFirstView.current });
    isFirstView.current = false;

    sendAnalyticsEvent({ eventType: 'pageview', url: pathname, userId: userIdRef.current });
  }, [pathname, searchParams]);

  return null;
}
