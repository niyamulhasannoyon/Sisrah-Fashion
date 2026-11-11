'use client';

import Script from 'next/script';

interface AnalyticsScriptsProps {
  facebookPixelId?: string;
  googleAnalyticsId?: string;
}

export default function AnalyticsScripts({ facebookPixelId, googleAnalyticsId }: AnalyticsScriptsProps) {
  const pixelId = (process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || facebookPixelId || '').trim();
  const gaId = (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || googleAnalyticsId || '').trim();

  return (
    <>
      {/* ── Meta (Facebook) Pixel Script ── */}
      {pixelId && (
        <>
          <Script
            id="facebook-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${pixelId}');
                // Initial PageView carries an eventID so the server-side (CAPI) twin de-duplicates.
                window.__sidPvId = window.__sidPvId || ('pv_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 10));
                fbq('track', 'PageView', {}, { eventID: window.__sidPvId });
                // Replay events that were fired before the Pixel finished loading (in order, after init).
                (window.__fbqBuffer || []).forEach(function (a) { try { fbq.apply(null, a); } catch (e) {} });
                window.__fbqBuffer = [];
              `,
            }}
          />
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${encodeURIComponent(pixelId)}&ev=PageView&noscript=1`}
              alt="FB Pixel"
            />
          </noscript>
        </>
      )}

      {/* ── Google Analytics 4 (GA4 / GTAG) Script ── */}
      {gaId && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`}
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                // page_view is sent by AnalyticsTracker (initial + SPA navigation) to avoid duplicates
                gtag('config', '${gaId}', {
                  send_page_view: false,
                });
              `,
            }}
          />
        </>
      )}
    </>
  );
}
