'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const lastPathname = useRef<string | null>(null);

  // Initialize unique session details and track geolocation once per session
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Get or generate visitor & session IDs
    let visitorId = localStorage.getItem('loomra_visitor_id');
    if (!visitorId) {
      visitorId = 'vis_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('loomra_visitor_id', visitorId);
    }

    let sessionId = sessionStorage.getItem('loomra_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('loomra_session_id', sessionId);
    }

    // 2. Fetch geolocation if not already cached in sessionStorage
    const fetchGeoInfo = async () => {
      const cachedGeo = sessionStorage.getItem('loomra_geo_cached');
      if (cachedGeo) return JSON.parse(cachedGeo);

      try {
        const res = await fetch('https://ipapi.co/json/');
        if (!res.ok) throw new Error('Failed to fetch IP geo info');
        const data = await res.json();
        
        const geoData = {
          ip: data.ip || '',
          country: data.country_name || '',
          city: data.city || ''
        };
        
        sessionStorage.setItem('loomra_geo_cached', JSON.stringify(geoData));
        return geoData;
      } catch (err) {
        console.warn('Geolocation lookup failed:', err);
        return { ip: '', country: 'Unknown', city: 'Unknown' };
      }
    };

    // Helper to send telemetry
    const sendEvent = async (eventPayload: any) => {
      const geo = await fetchGeoInfo();
      const payload = {
        ...eventPayload,
        sessionId,
        visitorId,
        ip: geo.ip,
        country: geo.country,
        city: geo.city,
        referrer: document.referrer || '',
        userId: user?.id || null,
      };

      // Use keepalive: true to ensure requests complete even if navigation happens immediately
      try {
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          keepalive: true
        });
      } catch (error) {
        console.error('Analytics tracking failed:', error);
      }
    };

    // 3. Listen to clicks on interactive elements
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactiveEl = target.closest('a, button, [data-track-click]');
      
      if (!interactiveEl) return;

      const clickText = interactiveEl.textContent?.trim() || '';
      
      // Determine click details
      let destination = '';
      if (interactiveEl.tagName.toLowerCase() === 'a') {
        destination = (interactiveEl as HTMLAnchorElement).getAttribute('href') || '';
      }
      
      const targetSnippet = `<${interactiveEl.tagName.toLowerCase()} class="${interactiveEl.className}" id="${interactiveEl.id}">${clickText.substring(0, 30)}</${interactiveEl.tagName.toLowerCase()}>`;

      sendEvent({
        eventType: 'click',
        url: window.location.pathname,
        clickText: clickText || destination || 'Interactive Element',
        clickTarget: targetSnippet
      });
    };

    document.addEventListener('click', handleGlobalClick, true);

    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
    };
  }, [user]);

  // 4. Track Page Views on pathname or searchParams change
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const fullPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    
    // Guard against duplicate page views in Dev / Strict Mode
    if (lastPathname.current === fullPath) return;
    lastPathname.current = fullPath;

    const sessionId = sessionStorage.getItem('loomra_session_id') || '';
    const visitorId = localStorage.getItem('loomra_visitor_id') || '';
    const cachedGeo = sessionStorage.getItem('loomra_geo_cached');
    const geo = cachedGeo ? JSON.parse(cachedGeo) : { ip: '', country: '', city: '' };

    const payload = {
      eventType: 'pageview',
      url: pathname,
      sessionId,
      visitorId,
      ip: geo.ip,
      country: geo.country,
      city: geo.city,
      referrer: document.referrer || '',
      userId: user?.id || null,
    };

    fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(err => console.error('Pageview tracking failed:', err));

  }, [pathname, searchParams, user]);

  return null;
}
